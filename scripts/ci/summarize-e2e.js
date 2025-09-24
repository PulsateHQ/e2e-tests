#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i].replace(/^--/, '');
    const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[++i] : true;
    out[key] = val;
  }
  return out;
}

function loadJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return null;
  }
}

function summarizePlaywrightResults(resultsJson) {
  const summary = { passed: 0, failed: 0, flaky: 0, durationMs: 0, topFailures: [] };
  if (!resultsJson) return summary;
  // Playwright JSON reporter: results structure depends on version; read totals if present
  const stats = resultsJson.stats || resultsJson;
  if (stats) {
    summary.passed = stats.expected || stats.passed || 0;
    summary.failed = stats.unexpected || stats.failed || 0;
    summary.flaky = stats.flaky || 0;
    summary.durationMs = stats.duration || stats.durationMs || 0;
  }

  // Derive top failures from suites/tests if available
  const failures = [];
  function walkSuite(suite) {
    if (!suite) return;
    if (Array.isArray(suite.suites)) suite.suites.forEach(walkSuite);
    if (Array.isArray(suite.tests)) {
      suite.tests.forEach((t) => {
        const outcome = t.outcome || t.status;
        if (outcome === 'unexpected' || outcome === 'failed') {
          const file = t.location?.file || t.file || t.titlePath?.[0] || 'unknown';
          failures.push({ file, title: t.title, error: t.error?.message || '', repeat: 1 });
        }
      });
    }
  }
  if (Array.isArray(resultsJson.suites)) resultsJson.suites.forEach(walkSuite);
  if (failures.length) {
    // Group by file
    const byFile = failures.reduce((acc, f) => {
      const key = f.file;
      acc[key] = acc[key] || { file: key, count: 0, samples: [] };
      acc[key].count += 1;
      if (acc[key].samples.length < 2) acc[key].samples.push(f.title);
      return acc;
    }, {});
    summary.topFailures = Object.values(byFile)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((f) => `• \`${f.file}\` — ${f.samples[0] || 'failed'}${f.count > 1 ? ` (x${f.count})` : ''}`);
  }

  return summary;
}

function formatDuration(ms) {
  if (!ms) return '';
  const m = Math.round(ms / 60000);
  return `${m}m`;
}

function main() {
  const args = parseArgs();
  const envName = args.env || '';
  const resultsPath = args.results || './playwright-report/results.json';
  const allureDir = args.allure || './allure-results';
  const runUrl = args['run-url'] || '';
  const output = args.output || `./artifacts/summary-${envName}.json`;

  const resultsJson = loadJson(resultsPath) || {};
  const summary = summarizePlaywrightResults(resultsJson);

  const payload = {
    env: envName,
    passed: summary.passed,
    failed: summary.failed,
    flaky: summary.flaky,
    topFailures: summary.topFailures,
    duration: formatDuration(summary.durationMs),
    runUrl,
    allurePresent: fs.existsSync(allureDir)
  };

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(payload, null, 2));
  console.log(`Wrote ${output}`);
}

main();

