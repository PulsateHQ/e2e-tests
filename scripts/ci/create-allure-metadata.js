#!/usr/bin/env node

/**
 * Create Allure metadata files (executor.json, environment.properties)
 * Usage: node create-allure-metadata.js [allure-results-dir]
 */

const fs = require('fs');
const path = require('path');

function createAllureMetadata(allureResultsDir = 'allure-results') {
  // Ensure directory exists
  if (!fs.existsSync(allureResultsDir)) {
    fs.mkdirSync(allureResultsDir, { recursive: true });
  }

  // Create executor.json
  const executorInfo = {
    name: 'GitHub Actions',
    type: 'github',
    buildOrder: parseInt(process.env.GITHUB_RUN_NUMBER) || 1,
    buildUrl: `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`,
    reportUrl: process.env.REPORT_URL || `${process.env.AWS_CLOUDFRONT_DISTRIBUTION}/runs/${process.env.GITHUB_RUN_ID}/index.html`,
    reportName: `E2E Tests - ${process.env.GITHUB_REF_NAME || 'main'}`,
    buildName: `Run #${process.env.GITHUB_RUN_NUMBER} - ${process.env.GITHUB_WORKFLOW} (${process.env.GITHUB_EVENT_NAME})`
  };

  fs.writeFileSync(
    path.join(allureResultsDir, 'executor.json'),
    JSON.stringify(executorInfo, null, 2)
  );

  // Create environment.properties
  const environmentProps = [
    `Git_Branch=${process.env.GITHUB_REF_NAME || 'unknown'}`,
    `Git_Commit=${process.env.GITHUB_SHA || 'unknown'}`,
    `Git_Repository=${process.env.GITHUB_REPOSITORY || 'unknown'}`,
    `Workflow=${process.env.GITHUB_WORKFLOW || 'unknown'}`,
    `Run_ID=${process.env.GITHUB_RUN_ID || 'unknown'}`,
    `Run_Number=${process.env.GITHUB_RUN_NUMBER || 'unknown'}`,
    `Event=${process.env.GITHUB_EVENT_NAME || 'unknown'}`,
    `Actor=${process.env.GITHUB_ACTOR || 'unknown'}`,
    `Node_Version=${process.version}`,
    `OS=${process.platform}`,
    `Timestamp=${new Date().toISOString()}`
  ];

  // Add environment-specific properties if available
  if (process.env.TEST_ENVIRONMENT) {
    environmentProps.push(`Test_Environment=${process.env.TEST_ENVIRONMENT}`);
  }

  if (process.env.BASE_URL) {
    environmentProps.push(`Base_URL=${process.env.BASE_URL}`);
  }

  // Try to get Playwright version
  try {
    const playwrightPkg = require('../../node_modules/@playwright/test/package.json');
    environmentProps.push(`Playwright_Version=${playwrightPkg.version}`);
  } catch (error) {
    // Playwright not found, skip
  }

  fs.writeFileSync(
    path.join(allureResultsDir, 'environment.properties'),
    environmentProps.join('\n') + '\n'
  );

  console.log(`Created Allure metadata in ${allureResultsDir}/`);
}

// Main execution
if (require.main === module) {
  const allureResultsDir = process.argv[2] || 'allure-results';
  createAllureMetadata(allureResultsDir);
}

module.exports = { createAllureMetadata };