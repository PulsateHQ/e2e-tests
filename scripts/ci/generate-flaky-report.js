#!/usr/bin/env node

/**
 * Generate human-readable flaky test reports
 * Usage: node generate-flaky-report.js <flaky-tests.json>
 */

const fs = require('fs');

function generateMarkdownReport(flakyData) {
  const { flakyTests, summary, timestamp, runId } = flakyData;
  
  let report = `# Flaky Test Report\n\n`;
  report += `**Generated:** ${new Date(timestamp).toLocaleString()}\n`;
  report += `**Run ID:** ${runId}\n\n`;
  
  // Summary section
  report += `## Summary\n\n`;
  report += `- **Total Tests Analyzed:** ${summary.totalTests}\n`;
  report += `- **Flaky Tests Detected:** ${summary.flakyTests}\n`;
  report += `- **Flaky Rate:** ${summary.flakyRate}%\n`;
  report += `- **Quarantine Candidates:** ${summary.quarantineCandidates}\n\n`;
  
  if (summary.severityBreakdown) {
    report += `### Severity Breakdown\n\n`;
    for (const [severity, count] of Object.entries(summary.severityBreakdown)) {
      const emoji = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
      report += `- ${emoji} **${severity.charAt(0).toUpperCase() + severity.slice(1)}:** ${count}\n`;
    }
    report += `\n`;
  }
  
  if (flakyTests.length === 0) {
    report += `## 🎉 No Flaky Tests Detected\n\nAll tests are running reliably!\n`;
    return report;
  }
  
  // Quarantine candidates
  const quarantineCandidates = flakyTests.filter(t => t.quarantineCandidate);
  if (quarantineCandidates.length > 0) {
    report += `## 🚨 Quarantine Candidates\n\n`;
    report += `The following tests should be considered for quarantine due to high failure rates or instability:\n\n`;
    
    for (const test of quarantineCandidates) {
      report += generateTestSection(test, true);
    }
  }
  
  // All flaky tests
  report += `## 🔍 All Flaky Tests\n\n`;
  
  const groupedBySeverity = groupTestsBySeverity(flakyTests);
  
  for (const severity of ['high', 'medium', 'low']) {
    const tests = groupedBySeverity[severity];
    if (!tests || tests.length === 0) continue;
    
    const emoji = severity === 'high' ? '🔴' : severity === 'medium' ? '🟡' : '🟢';
    report += `### ${emoji} ${severity.charAt(0).toUpperCase() + severity.slice(1)} Severity\n\n`;
    
    for (const test of tests) {
      report += generateTestSection(test);
    }
  }
  
  // Recommendations section
  report += `## 💡 General Recommendations\n\n`;
  report += `1. **Immediate Actions:**\n`;
  report += `   - Review and fix high-severity flaky tests first\n`;
  report += `   - Consider quarantining tests with >40% failure rate\n`;
  report += `   - Add \`@flaky\` tags to identified tests\n\n`;
  
  report += `2. **Long-term Improvements:**\n`;
  report += `   - Implement better wait strategies and element selectors\n`;
  report += `   - Review test data management and cleanup processes\n`;
  report += `   - Consider test environment stability improvements\n`;
  report += `   - Add monitoring for test execution patterns\n\n`;
  
  report += `3. **Team Assignments:**\n`;
  const teamAssignments = groupTestsByOwner(flakyTests);
  for (const [team, tests] of Object.entries(teamAssignments)) {
    report += `   - **${team}:** ${tests.length} flaky tests\n`;
  }
  
  return report;
}

function generateTestSection(test, isQuarantineCandidate = false) {
  let section = `#### ${test.title}\n\n`;
  
  section += `**File:** \`${test.file}\`\n`;
  section += `**Owner:** ${test.owner}\n`;
  section += `**Severity:** ${getSeverityEmoji(test.severity)} ${test.severity}\n`;
  
  if (test.failureRate !== undefined) {
    section += `**Failure Rate:** ${(test.failureRate * 100).toFixed(1)}% (${test.failures}/${test.totalRuns} runs)\n`;
  }
  
  if (test.detectionMethods) {
    section += `**Detection:** ${test.detectionMethods.join(', ')}\n`;
  }
  
  if (test.avgRetries > 0) {
    section += `**Avg Retries:** ${test.avgRetries.toFixed(1)}\n`;
  }
  
  section += `**Last Seen:** ${new Date(test.lastSeen).toLocaleDateString()}\n\n`;
  
  if (test.error) {
    section += `**Latest Error:**\n`;
    section += `\`\`\`\n${test.error}\n\`\`\`\n\n`;
  }
  
  if (test.recommendations && test.recommendations.length > 0) {
    section += `**Recommendations:**\n`;
    for (const rec of test.recommendations) {
      section += `- ${rec}\n`;
    }
    section += `\n`;
  }
  
  if (isQuarantineCandidate) {
    section += `> ⚠️ **QUARANTINE CANDIDATE**: This test should be tagged with \`@flaky\` and moved to quarantine suite.\n\n`;
  }
  
  section += `---\n\n`;
  
  return section;
}

function getSeverityEmoji(severity) {
  switch (severity) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🟢';
    default: return '⚪';
  }
}

function groupTestsBySeverity(tests) {
  return tests.reduce((groups, test) => {
    const severity = test.severity || 'low';
    if (!groups[severity]) groups[severity] = [];
    groups[severity].push(test);
    return groups;
  }, {});
}

function groupTestsByOwner(tests) {
  return tests.reduce((groups, test) => {
    const owner = test.owner || 'unknown';
    if (!groups[owner]) groups[owner] = [];
    groups[owner].push(test);
    return groups;
  }, {});
}

function generateJSONReport(flakyData) {
  // Enhanced JSON report with additional metadata
  return {
    ...flakyData,
    reportMetadata: {
      version: '1.0',
      generatedAt: new Date().toISOString(),
      format: 'flaky-test-report-v1'
    },
    quarantineList: flakyData.flakyTests
      .filter(t => t.quarantineCandidate)
      .map(t => ({
        file: t.file,
        title: t.title,
        reason: `${(t.failureRate * 100).toFixed(1)}% failure rate`,
        owner: t.owner,
        severity: t.severity
      })),
    teamSummary: Object.entries(groupTestsByOwner(flakyData.flakyTests))
      .map(([team, tests]) => ({
        team,
        flakyCount: tests.length,
        highSeverityCount: tests.filter(t => t.severity === 'high').length,
        quarantineCandidates: tests.filter(t => t.quarantineCandidate).length
      }))
  };
}

// Main execution
if (require.main === module) {
  const inputFile = process.argv[2];
  const format = process.argv[3] || 'markdown';
  
  if (!inputFile) {
    console.error('Usage: node generate-flaky-report.js <flaky-tests.json> [markdown|json]');
    process.exit(1);
  }
  
  if (!fs.existsSync(inputFile)) {
    console.error(`Input file does not exist: ${inputFile}`);
    process.exit(1);
  }
  
  try {
    const flakyData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    if (format === 'json') {
      const jsonReport = generateJSONReport(flakyData);
      console.log(JSON.stringify(jsonReport, null, 2));
    } else {
      const markdownReport = generateMarkdownReport(flakyData);
      console.log(markdownReport);
    }
  } catch (error) {
    console.error(`Error generating report: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { generateMarkdownReport, generateJSONReport };