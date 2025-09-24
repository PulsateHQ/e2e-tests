#!/usr/bin/env node

/*
  Summarize Playwright and Allure results into a compact summary.json
  Also maintains flaky test history and generates flaky-tests.{json,md}

  Args:
    --playwright-dir <dir>   Root where per-env playwright-report/<env>/results.json reside
    --allure-dir <dir>       Root where per-env allure-results/<env> reside (optional)
    --out <file>             Output summary.json file path
    --history <file>         Optional history JSON path to read and update
    --flakes-json <file>     Output flaky-tests.json path
    --flakes-md <file>       Output flaky-tests.md path
    --digest                 Produce a daily digest (uses history only)
*/

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--digest') {
      args.digest = true;
    } else if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

function loadJson(filePath) {
  try {
    if (!filePath) return undefined;
    if (!fs.existsSync(filePath)) return undefined;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to load JSON: ${filePath}: ${err.message}`);
    return undefined;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function safeRead(filePath) {
  try {
    if (!fs.existsSync(filePath)) return undefined;
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return undefined;
  }
}

function collectPlaywrightEnvs(playwrightDir) {
  const envs = [];
  if (!playwrightDir || !fs.existsSync(playwrightDir)) return envs;
  for (const envName of fs.readdirSync(playwrightDir)) {
    const direct = path.join(playwrightDir, envName, 'results.json');
    const nested = path.join(playwrightDir, envName, 'playwright-report', 'results.json');
    if (fs.existsSync(direct) || fs.existsSync(nested)) envs.push(envName);
  }
  return envs.sort();
}

function aggregateFromPlaywrightJson(resultsJsonPath) {
  const json = loadJson(resultsJsonPath);
  const aggregate = {
    passed: 0,
    failed: 0,
    flaky: 0,
    durationMs: 0,
    topFailures: [],
    failures: []
  };
  if (!json) return aggregate;

  function walkSuite(suite, filePathChain) {
    const currentFile = suite.file || undefined;
    const nextChain = currentFile ? currentFile : filePathChain;
    if (suite.suites) {
      for (const child of suite.suites) walkSuite(child, nextChain);
    }
    if (suite.specs) {
      for (const spec of suite.specs) {
        const specTitle = spec.title || '';
        let isFailed = false;
        let isFlaky = false;
        let isPassed = false;
        let testDuration = 0;
        if (spec.tests) {
          for (const test of spec.tests) {
            // Playwright JSON may include outcome and results
            const outcome = test.outcome;
            if (outcome === 'unexpected') isFailed = true;
            if (outcome === 'flaky') isFlaky = true;
            if (outcome === 'expected') isPassed = true;
            if (Array.isArray(test.results)) {
              let seenPass = false;
              let seenFail = false;
              for (const res of test.results) {
                const status = res.status;
                if (typeof res.duration === 'number') testDuration += res.duration;
                if (status === 'passed') seenPass = true;
                if (status && status !== 'skipped' && status !== 'passed') seenFail = true;
              }
              if (seenPass && seenFail) isFlaky = true;
              if (seenPass && !seenFail) isPassed = true;
              if (!seenPass && seenFail) isFailed = true;
            }
          }
        }
        aggregate.durationMs += testDuration;
        if (isFailed) {
          aggregate.failed += 1;
          aggregate.failures.push({ file: nextChain, title: specTitle });
        } else if (isFlaky) {
          aggregate.flaky += 1;
        } else if (isPassed) {
          aggregate.passed += 1;
        }
      }
    }
  }

  if (json.suites) {
    for (const suite of json.suites) walkSuite(suite, undefined);
  }

  // Top 3 failures by frequency of file
  const byFile = new Map();
  for (const f of aggregate.failures) {
    const k = f.file || 'unknown';
    byFile.set(k, (byFile.get(k) || 0) + 1);
  }
  aggregate.topFailures = Array.from(byFile.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([file, count]) => ({ file, count }));

  return aggregate;
}

function updateHistory(historyPath, timestampIso, envName, envAgg) {
  const history = loadJson(historyPath) || { runs: [] };
  const run = {
    timestamp: timestampIso,
    env: envName,
    passed: envAgg.passed,
    failed: envAgg.failed,
    flaky: envAgg.flaky
  };
  history.runs.push(run);
  writeJson(historyPath, history);
  return history;
}

function computeFlakesFromHistory(history, sinceDays = 7) {
  const cutoff = Date.now() - sinceDays * 24 * 60 * 60 * 1000;
  const filtered = (history?.runs || []).filter(r => new Date(r.timestamp).getTime() >= cutoff);
  // This simple history only captures counts, so we cannot map to files.
  // For a lightweight approach, we will rely on the latest per-env topFailures as suspects.
  const totals = filtered.reduce(
    (acc, r) => {
      acc.totalRuns += 1;
      acc.totalFlaky += r.flaky || 0;
      return acc;
    },
    { totalRuns: 0, totalFlaky: 0 }
  );
  return { summary: totals };
}

function writeFlakeReports(jsonPath, mdPath, suspects, overall) {
  const payload = { suspects, overall };
  if (jsonPath) writeJson(jsonPath, payload);
  if (mdPath) {
    const lines = [];
    lines.push('# Flaky Tests (last 7 days)');
    lines.push('');
    lines.push(`Total flaky occurrences: ${overall?.summary?.totalFlaky || 0}`);
    lines.push('');
    lines.push('| File | Failures (latest run) |');
    lines.push('|---|---|');
    for (const s of suspects) {
      lines.push(`| ${s.file} | ${s.count} |`);
    }
    fs.mkdirSync(path.dirname(mdPath), { recursive: true });
    fs.writeFileSync(mdPath, lines.join('\n'));
  }
}

function buildSummary(envAggs, ctx) {
  const overall = Object.values(envAggs).reduce(
    (acc, env) => {
      acc.passed += env.passed;
      acc.failed += env.failed;
      acc.flaky += env.flaky;
      acc.durationMs += env.durationMs;
      return acc;
    },
    { passed: 0, failed: 0, flaky: 0, durationMs: 0 }
  );
  const status = overall.failed > 0 ? 'failed' : 'passed';
  return {
    repo: process.env.GITHUB_REPOSITORY || ctx.repo,
    commit: (process.env.GITHUB_SHA || '').slice(0, 7),
    runId: process.env.GITHUB_RUN_ID || '',
    runUrl: process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : '',
    generatedAt: new Date().toISOString(),
    overall: { ...overall, status },
    envs: envAggs
  };
}

function main() {
  const args = parseArgs(process.argv);
  const nowIso = new Date().toISOString();

  if (args.digest) {
    const history = loadJson(args.history || 'reports/history.json') || { runs: [] };
    const flakes = computeFlakesFromHistory(history, 7);
    const digest = {
      generatedAt: nowIso,
      repo: process.env.GITHUB_REPOSITORY || '',
      flakeSummary: flakes.summary
    };
    if (args.out) writeJson(args.out, digest);
    return;
  }

  const playwrightDir = args['playwright-dir'] || 'artifacts/playwright-report';
  const envs = collectPlaywrightEnvs(playwrightDir);
  const envAggs = {};
  for (const envName of envs) {
    const direct = path.join(playwrightDir, envName, 'results.json');
    const nested = path.join(playwrightDir, envName, 'playwright-report', 'results.json');
    const resultsJson = fs.existsSync(direct) ? direct : nested;
    envAggs[envName] = aggregateFromPlaywrightJson(resultsJson);
  }

  const summary = buildSummary(envAggs, {});
  if (args.out) writeJson(args.out, summary);

  // Update history and generate flake reports using latest top failures as suspects
  const suspects = [];
  for (const envName of Object.keys(envAggs)) {
    const env = envAggs[envName];
    for (const f of env.topFailures) {
      suspects.push({ ...f, env: envName });
    }
  }
  const history = args.history ? updateHistory(args.history, nowIso, 'all', summary.overall) : undefined;
  const flakeOverall = computeFlakesFromHistory(history || { runs: [] }, 7);
  if (args['flakes-json'] || args['flakes-md']) {
    writeFlakeReports(args['flakes-json'], args['flakes-md'], suspects, flakeOverall);
  }
}

main();

