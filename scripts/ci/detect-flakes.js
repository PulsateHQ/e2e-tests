#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const glob = require('glob');

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

function loadSummaries(pattern) {
  const files = glob.sync(pattern);
  return files.map((f) => ({ file: f, data: JSON.parse(fs.readFileSync(f, 'utf8')) }));
}

function detectFlakes(summaries) {
  // Lightweight: any env with flaky > 0 contributes to flake list
  const total = { passed: 0, failed: 0, flaky: 0 };
  const envs = [];
  summaries.forEach(({ data }) => {
    total.passed += Number(data.passed || 0);
    total.failed += Number(data.failed || 0);
    total.flaky += Number(data.flaky || 0);
    envs.push({ env: data.env, passed: data.passed, failed: data.failed, flaky: data.flaky, duration: data.duration });
  });

  // Without history artifact we just roll up; repository can extend later
  const flakes = [];
  summaries.forEach(({ data }) => {
    if (Array.isArray(data.topFailures) && data.topFailures.length && data.flaky > 0) {
      data.topFailures.forEach((line) => flakes.push({ spec: line, env: data.env }));
    }
  });

  return { total, envs, flakes };
}

function toMarkdown(report) {
  const lines = [];
  lines.push(`# Flaky Tests Report`);
  lines.push('');
  lines.push(`- Total Passed: ${report.total.passed}`);
  lines.push(`- Total Failed: ${report.total.failed}`);
  lines.push(`- Total Flaky (retried): ${report.total.flaky}`);
  lines.push('');
  lines.push('## By Environment');
  report.envs.forEach((e) => {
    lines.push(`- ${e.env}: passed ${e.passed}, failed ${e.failed}, flaky ${e.flaky}, duration ${e.duration}`);
  });
  lines.push('');
  lines.push('## Suspected Flakes (lightweight)');
  if (report.flakes.length === 0) {
    lines.push('- None detected');
  } else {
    report.flakes.forEach((f) => lines.push(`- ${f.spec} (${f.env})`));
  }
  return lines.join('\n');
}

function main() {
  const args = parseArgs();
  const pattern = args.summaries || 'summaries/*.json';
  const jsonOut = args.json || 'reports/flaky-tests.json';
  const mdOut = args.md || 'reports/flaky-tests.md';

  const summaries = loadSummaries(pattern);
  const report = detectFlakes(summaries);

  fs.mkdirSync(path.dirname(jsonOut), { recursive: true });
  fs.writeFileSync(jsonOut, JSON.stringify(report, null, 2));
  fs.writeFileSync(mdOut, toMarkdown(report));
  console.log(`Wrote ${jsonOut} and ${mdOut}`);
}

main();

