#!/usr/bin/env node

/**
 * Flaky Test Detection System
 * Analyzes test results to identify flaky tests and generate reports
 * Usage: node flaky-detector.js <artifacts-directory> [--history-days=7] [--min-runs=3] [--flaky-threshold=0.2]
 */

const fs = require('fs');
const path = require('path');

class FlakyDetector {
  constructor(options = {}) {
    this.historyDays = options.historyDays || 7;
    this.minRuns = options.minRuns || 3;
    this.flakyThreshold = options.flakyThreshold || 0.2; // 20% failure rate
    this.immediateRetryThreshold = options.immediateRetryThreshold || 1;
  }

  async detectFlakyTests(artifactsDir) {
    const results = {
      timestamp: new Date().toISOString(),
      runId: process.env.GITHUB_RUN_ID,
      criteria: {
        historyDays: this.historyDays,
        minRuns: this.minRuns,
        flakyThreshold: this.flakyThreshold
      },
      flakyTests: [],
      summary: {
        totalTests: 0,
        flakyTests: 0,
        flakyRate: 0
      }
    };

    try {
      // Detect immediate flakes (failed then passed on retry in current run)
      const immediateFlakes = await this.detectImmediateFlakes(artifactsDir);
      
      // Load historical data and detect historical flakes
      const historicalFlakes = await this.detectHistoricalFlakes(artifactsDir);
      
      // Combine and deduplicate flaky tests
      const allFlakes = this.combineFlakeDetection(immediateFlakes, historicalFlakes);
      
      // Enrich with ownership and recommendation data
      results.flakyTests = await this.enrichFlakyTests(allFlakes);
      
      // Calculate summary statistics
      results.summary = this.calculateSummary(results.flakyTests);
      
      return results;
    } catch (error) {
      console.error(`Error detecting flaky tests: ${error.message}`);
      results.error = error.message;
      return results;
    }
  }

  async detectImmediateFlakes(artifactsDir) {
    const flakes = [];
    const resultFiles = this.findResultFiles(artifactsDir);
    
    for (const file of resultFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        const fileFlakes = this.analyzeResultsForImmediateFlakes(data, file);
        flakes.push(...fileFlakes);
      } catch (error) {
        console.warn(`Error processing ${file}: ${error.message}`);
      }
    }
    
    return flakes;
  }

  analyzeResultsForImmediateFlakes(data, filePath) {
    const flakes = [];
    
    if (!data.suites) return flakes;
    
    for (const suite of data.suites) {
      if (!suite.specs) continue;
      
      for (const spec of suite.specs) {
        if (!spec.tests) continue;
        
        for (const test of spec.tests) {
          if (this.isImmediateFlake(test)) {
            flakes.push({
              title: test.title,
              file: spec.title,
              type: 'immediate',
              source: path.basename(filePath),
              retryCount: test.results ? test.results.length : 0,
              error: this.extractTestError(test),
              lastSeen: new Date().toISOString()
            });
          }
        }
      }
    }
    
    return flakes;
  }

  isImmediateFlake(test) {
    if (!test.results || test.results.length <= 1) return false;
    
    // Check if test failed initially but then passed on retry
    const hasInitialFailure = test.results[0].status === 'failed';
    const hasSubsequentPass = test.results.slice(1).some(r => r.status === 'passed');
    
    return hasInitialFailure && hasSubsequentPass;
  }

  async detectHistoricalFlakes(artifactsDir) {
    // This would typically load from a persistent store (S3, database, etc.)
    // For now, we'll simulate with a simple history tracking approach
    
    const historyFile = path.join(artifactsDir, '..', 'test-history.json');
    let history = { tests: {} };
    
    if (fs.existsSync(historyFile)) {
      try {
        history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      } catch (error) {
        console.warn(`Error reading history file: ${error.message}`);
      }
    }
    
    // Update history with current run results
    await this.updateTestHistory(artifactsDir, history);
    
    // Analyze history for flaky patterns
    const historicalFlakes = this.analyzeHistoryForFlakes(history);
    
    // Save updated history
    try {
      fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
    } catch (error) {
      console.warn(`Error saving history: ${error.message}`);
    }
    
    return historicalFlakes;
  }

  async updateTestHistory(artifactsDir, history) {
    const resultFiles = this.findResultFiles(artifactsDir);
    const runId = process.env.GITHUB_RUN_ID || Date.now().toString();
    const timestamp = new Date().toISOString();
    
    for (const file of resultFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        this.updateHistoryFromResults(data, history, runId, timestamp);
      } catch (error) {
        console.warn(`Error processing ${file} for history: ${error.message}`);
      }
    }
  }

  updateHistoryFromResults(data, history, runId, timestamp) {
    if (!data.suites) return;
    
    for (const suite of data.suites) {
      if (!suite.specs) continue;
      
      for (const spec of suite.specs) {
        if (!spec.tests) continue;
        
        for (const test of spec.tests) {
          const testKey = `${spec.title}::${test.title}`;
          
          if (!history.tests[testKey]) {
            history.tests[testKey] = {
              title: test.title,
              file: spec.title,
              runs: []
            };
          }
          
          history.tests[testKey].runs.push({
            runId,
            timestamp,
            status: test.status,
            duration: test.results ? test.results.reduce((sum, r) => sum + (r.duration || 0), 0) : 0,
            retries: test.results ? test.results.length - 1 : 0,
            error: test.status === 'failed' ? this.extractTestError(test) : null
          });
          
          // Keep only recent runs (within history window)
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - this.historyDays);
          
          history.tests[testKey].runs = history.tests[testKey].runs
            .filter(run => new Date(run.timestamp) >= cutoffDate)
            .slice(-20); // Keep max 20 runs per test
        }
      }
    }
  }

  analyzeHistoryForFlakes(history) {
    const flakes = [];
    
    for (const [testKey, testData] of Object.entries(history.tests)) {
      if (testData.runs.length < this.minRuns) continue;
      
      const analysis = this.analyzeTestRuns(testData.runs);
      
      if (analysis.isFlaky) {
        flakes.push({
          title: testData.title,
          file: testData.file,
          type: 'historical',
          ...analysis,
          lastSeen: testData.runs[testData.runs.length - 1].timestamp
        });
      }
    }
    
    return flakes;
  }

  analyzeTestRuns(runs) {
    const totalRuns = runs.length;
    const failures = runs.filter(r => r.status === 'failed').length;
    const passes = runs.filter(r => r.status === 'passed').length;
    const failureRate = failures / totalRuns;
    
    // Calculate patterns
    const hasIntermittentFailures = this.hasIntermittentPattern(runs);
    const hasRecentFailures = runs.slice(-5).some(r => r.status === 'failed');
    const avgRetries = runs.reduce((sum, r) => sum + r.retries, 0) / totalRuns;
    
    const isFlaky = failureRate >= this.flakyThreshold && 
                    failureRate < 0.9 && // Not consistently failing
                    passes > 0; // Has some passes
    
    return {
      isFlaky,
      failureRate,
      totalRuns,
      failures,
      passes,
      hasIntermittentFailures,
      hasRecentFailures,
      avgRetries,
      severity: this.calculateSeverity(failureRate, hasRecentFailures, avgRetries)
    };
  }

  hasIntermittentPattern(runs) {
    // Check for alternating pass/fail pattern
    let alternations = 0;
    for (let i = 1; i < runs.length; i++) {
      if (runs[i].status !== runs[i-1].status) {
        alternations++;
      }
    }
    
    return alternations >= Math.min(runs.length * 0.3, 3);
  }

  calculateSeverity(failureRate, hasRecentFailures, avgRetries) {
    if (failureRate >= 0.5 && hasRecentFailures) return 'high';
    if (failureRate >= 0.3 || avgRetries >= 2) return 'medium';
    return 'low';
  }

  combineFlakeDetection(immediateFlakes, historicalFlakes) {
    const combined = new Map();
    
    // Add immediate flakes
    for (const flake of immediateFlakes) {
      const key = `${flake.file}::${flake.title}`;
      combined.set(key, { ...flake, detectionMethods: ['immediate'] });
    }
    
    // Add or merge historical flakes
    for (const flake of historicalFlakes) {
      const key = `${flake.file}::${flake.title}`;
      
      if (combined.has(key)) {
        const existing = combined.get(key);
        existing.detectionMethods.push('historical');
        existing.failureRate = flake.failureRate;
        existing.totalRuns = flake.totalRuns;
        existing.severity = flake.severity;
      } else {
        combined.set(key, { ...flake, detectionMethods: ['historical'] });
      }
    }
    
    return Array.from(combined.values());
  }

  async enrichFlakyTests(flakes) {
    const enriched = [];
    
    for (const flake of flakes) {
      const enrichedFlake = {
        ...flake,
        owner: await this.getTestOwner(flake.file),
        recommendations: this.generateRecommendations(flake),
        quarantineCandidate: this.shouldQuarantine(flake)
      };
      
      enriched.push(enrichedFlake);
    }
    
    // Sort by severity and frequency
    return enriched.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
      
      if (severityDiff !== 0) return severityDiff;
      
      return (b.failureRate || 0) - (a.failureRate || 0);
    });
  }

  async getTestOwner(filePath) {
    // This would typically read from CODEOWNERS file
    // For now, return a default mapping based on file patterns
    
    const patterns = {
      'api/': 'backend-team',
      'ui/': 'frontend-team',
      'campaign': 'campaigns-team',
      'user': 'users-team',
      'admin': 'admin-team'
    };
    
    for (const [pattern, team] of Object.entries(patterns)) {
      if (filePath.includes(pattern)) {
        return team;
      }
    }
    
    return 'platform-team'; // default
  }

  generateRecommendations(flake) {
    const recommendations = [];
    
    if (flake.detectionMethods.includes('immediate')) {
      recommendations.push('Add explicit waits or improve element selectors');
      recommendations.push('Review test data setup and cleanup');
    }
    
    if (flake.failureRate > 0.4) {
      recommendations.push('Consider breaking into smaller, more focused tests');
      recommendations.push('Review test environment stability');
    }
    
    if (flake.avgRetries > 2) {
      recommendations.push('Investigate timing issues and race conditions');
    }
    
    if (flake.hasIntermittentFailures) {
      recommendations.push('Check for external dependencies or async operations');
    }
    
    return recommendations;
  }

  shouldQuarantine(flake) {
    return flake.severity === 'high' || 
           (flake.failureRate > 0.3 && flake.hasRecentFailures) ||
           flake.avgRetries >= 3;
  }

  calculateSummary(flakyTests) {
    const totalTests = new Set(flakyTests.map(f => `${f.file}::${f.title}`)).size;
    const flakyCount = flakyTests.length;
    const flakyRate = totalTests > 0 ? (flakyCount / totalTests * 100).toFixed(1) : 0;
    
    const severityCounts = flakyTests.reduce((acc, test) => {
      acc[test.severity] = (acc[test.severity] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalTests,
      flakyTests: flakyCount,
      flakyRate: parseFloat(flakyRate),
      quarantineCandidates: flakyTests.filter(t => t.quarantineCandidate).length,
      severityBreakdown: severityCounts
    };
  }

  findResultFiles(artifactsDir) {
    const files = [];
    
    function searchDir(dir) {
      if (!fs.existsSync(dir)) return;
      
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          searchDir(fullPath);
        } else if (entry.name.match(/^results-.+\.json$/)) {
          files.push(fullPath);
        }
      }
    }
    
    searchDir(artifactsDir);
    return files;
  }

  extractTestError(test) {
    if (!test.results) return 'Unknown error';
    
    const failedResult = test.results.find(r => r.status === 'failed');
    if (failedResult && failedResult.error) {
      const errorMessage = failedResult.error.message || failedResult.error.toString();
      return errorMessage.split('\n')[0].substring(0, 200);
    }
    
    return 'Test failed without error details';
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node flaky-detector.js <artifacts-directory> [--history-days=7] [--min-runs=3] [--flaky-threshold=0.2]');
    process.exit(1);
  }
  
  const artifactsDir = args[0];
  const options = {};
  
  // Parse options
  for (const arg of args.slice(1)) {
    const match = arg.match(/^--(.+)=(.+)$/);
    if (match) {
      const [, key, value] = match;
      options[key.replace(/-/g, '')] = isNaN(value) ? value : parseFloat(value);
    }
  }
  
  const detector = new FlakyDetector(options);
  
  detector.detectFlakyTests(artifactsDir)
    .then(results => {
      console.log(JSON.stringify(results, null, 2));
    })
    .catch(error => {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { FlakyDetector };