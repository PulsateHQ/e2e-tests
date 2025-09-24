#!/usr/bin/env node

/**
 * Aggregate test results from multiple environments and test types
 * Usage: node aggregate-results.js <artifacts-directory>
 */

const fs = require('fs');
const path = require('path');

function aggregateResults(artifactsDir) {
  const results = {
    overallStatus: 'success',
    environments: {},
    totals: {
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      duration: 0
    },
    failures: [],
    flaky: [],
    timestamp: new Date().toISOString(),
    runId: process.env.GITHUB_RUN_ID,
    runUrl: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
  };

  try {
    // Find all test result files
    const resultFiles = findResultFiles(artifactsDir);
    
    for (const file of resultFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        processResultFile(data, file, results);
      } catch (error) {
        console.error(`Error processing ${file}: ${error.message}`);
      }
    }

    // Find all health check files
    const healthCheckFiles = findHealthCheckFiles(artifactsDir);
    
    for (const file of healthCheckFiles) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf8'));
        processHealthCheckFile(data, file, results);
      } catch (error) {
        console.error(`Error processing health check ${file}: ${error.message}`);
      }
    }

    // Determine overall status
    if (results.totals.failed > 0) {
      results.overallStatus = 'failure';
    } else if (Object.values(results.environments).some(env => !env.healthCheck)) {
      results.overallStatus = 'failure';
    }

    // Sort failures by frequency/importance
    results.failures.sort((a, b) => b.occurrences - a.occurrences);
    results.failures = results.failures.slice(0, 5); // Top 5 failures

  } catch (error) {
    console.error(`Error aggregating results: ${error.message}`);
    results.overallStatus = 'failure';
    results.error = error.message;
  }

  return results;
}

function findResultFiles(artifactsDir) {
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

function findHealthCheckFiles(artifactsDir) {
  const files = [];
  
  function searchDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        searchDir(fullPath);
      } else if (entry.name.match(/^health-check-.+\.json$/)) {
        files.push(fullPath);
      }
    }
  }
  
  searchDir(artifactsDir);
  return files;
}

function processResultFile(data, filePath, results) {
  // Extract environment and test type from filename
  const filename = path.basename(filePath);
  const match = filename.match(/results-(.+)-(.+)\.json$/);
  
  if (!match) {
    console.warn(`Cannot parse filename: ${filename}`);
    return;
  }
  
  const [, environment, testType] = match;
  
  if (!results.environments[environment]) {
    results.environments[environment] = {
      healthCheck: false,
      testTypes: {},
      totals: { passed: 0, failed: 0, skipped: 0, flaky: 0, duration: 0 }
    };
  }
  
  const env = results.environments[environment];
  
  // Process Playwright test results
  if (data.suites) {
    const testResults = processPlaywrightResults(data);
    
    env.testTypes[testType] = {
      status: testResults.failed > 0 ? 'failure' : 'success',
      ...testResults
    };
    
    // Add to environment totals
    env.totals.passed += testResults.passed;
    env.totals.failed += testResults.failed;
    env.totals.skipped += testResults.skipped;
    env.totals.flaky += testResults.flaky;
    env.totals.duration += testResults.duration;
    
    // Add to global totals
    results.totals.passed += testResults.passed;
    results.totals.failed += testResults.failed;
    results.totals.skipped += testResults.skipped;
    results.totals.flaky += testResults.flaky;
    results.totals.duration += testResults.duration;
    
    // Collect failures
    for (const failure of testResults.failures) {
      addFailure(results.failures, failure, environment, testType);
    }
    
    // Collect flaky tests
    for (const flaky of testResults.flaky_tests) {
      addFlaky(results.flaky, flaky, environment, testType);
    }
  }
}

function processHealthCheckFile(data, filePath, results) {
  const filename = path.basename(filePath);
  const match = filename.match(/health-check-(.+)\.json$/);
  
  if (!match) return;
  
  const environment = match[1];
  
  if (!results.environments[environment]) {
    results.environments[environment] = {
      healthCheck: false,
      testTypes: {},
      totals: { passed: 0, failed: 0, skipped: 0, flaky: 0, duration: 0 }
    };
  }
  
  // Check if health check passed
  const healthPassed = data.suites && data.suites.some(suite => 
    suite.specs && suite.specs.some(spec => 
      spec.tests && spec.tests.some(test => test.status === 'passed')
    )
  );
  
  results.environments[environment].healthCheck = healthPassed;
}

function processPlaywrightResults(data) {
  const result = {
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
    duration: 0,
    failures: [],
    flaky_tests: []
  };
  
  if (!data.suites) return result;
  
  for (const suite of data.suites) {
    if (!suite.specs) continue;
    
    for (const spec of suite.specs) {
      if (!spec.tests) continue;
      
      for (const test of spec.tests) {
        result.duration += test.results ? test.results.reduce((sum, r) => sum + (r.duration || 0), 0) : 0;
        
        if (test.status === 'passed') {
          result.passed++;
        } else if (test.status === 'failed') {
          result.failed++;
          
          // Check if this is a flaky test (passed on retry)
          const hasPassedRetry = test.results && test.results.some(r => r.status === 'passed');
          
          if (hasPassedRetry) {
            result.flaky++;
            result.flaky_tests.push({
              title: test.title,
              file: spec.title,
              error: getTestError(test)
            });
          } else {
            result.failures.push({
              title: test.title,
              file: spec.title,
              error: getTestError(test)
            });
          }
        } else if (test.status === 'skipped') {
          result.skipped++;
        }
      }
    }
  }
  
  return result;
}

function getTestError(test) {
  if (!test.results) return 'Unknown error';
  
  const failedResult = test.results.find(r => r.status === 'failed');
  if (failedResult && failedResult.error) {
    // Extract meaningful error message
    const errorMessage = failedResult.error.message || failedResult.error.toString();
    return errorMessage.split('\n')[0].substring(0, 200); // First line, max 200 chars
  }
  
  return 'Test failed without error details';
}

function addFailure(failures, failure, environment, testType) {
  const existing = failures.find(f => f.title === failure.title && f.file === failure.file);
  
  if (existing) {
    existing.occurrences++;
    if (!existing.environments.includes(environment)) {
      existing.environments.push(environment);
    }
  } else {
    failures.push({
      ...failure,
      environments: [environment],
      testType,
      occurrences: 1
    });
  }
}

function addFlaky(flakyTests, flaky, environment, testType) {
  const existing = flakyTests.find(f => f.title === flaky.title && f.file === flaky.file);
  
  if (existing) {
    existing.occurrences++;
    if (!existing.environments.includes(environment)) {
      existing.environments.push(environment);
    }
  } else {
    flakyTests.push({
      ...flaky,
      environments: [environment],
      testType,
      occurrences: 1
    });
  }
}

// Main execution
if (require.main === module) {
  const artifactsDir = process.argv[2];
  
  if (!artifactsDir) {
    console.error('Usage: node aggregate-results.js <artifacts-directory>');
    process.exit(1);
  }
  
  if (!fs.existsSync(artifactsDir)) {
    console.error(`Artifacts directory does not exist: ${artifactsDir}`);
    process.exit(1);
  }
  
  const results = aggregateResults(artifactsDir);
  console.log(JSON.stringify(results, null, 2));
}

module.exports = { aggregateResults };