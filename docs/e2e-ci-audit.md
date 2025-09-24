## E2E CI Audit and Proposal

### Current State
- Playwright-based E2E with reporters: html, github, json, junit, allure
- Env selection via `DOTENV_CONFIG_PATH` (.env.sealion, .env.leopard, .env.jaguar)
- No CI workflows or Slack integration present in repo

### Issues Observed
- Missing CI orchestration and notification templates
- No artifact persistence policy or daily digest
- No flaky detection beyond Playwright retries

### Proposed Architecture

```
GitHub Actions: e2e
┌─────────────┐   ┌─────────────┐   ┌──────────────┐   ┌───────────────┐
│  prepare    │─▶│ notify_start │─▶│  test[matrix] │─▶│     report     │
└─────────────┘   └─────────────┘   └──────────────┘   └───────────────┘
                                       env: sealion|leopard|jaguar
```

- prepare: checkout, install, cache browsers
- notify_start: one Slack start message (creates thread)
- test (matrix): per env run; health-check; upload artifacts (Allure, Playwright reports)
- report: download artifacts, generate Allure report, summarize, post final Slack in the thread
- daily_digest: scheduled run posts flake summary

### Caching & Concurrency
- npm cache via setup-node; Playwright browser cache keyed by lockfile/OS/node
- concurrency group per ref and workflow; cancel in-progress on new commit

### Artifacts
- Always upload `allure-results-<env>` and `playwright-report-<env>`
- Report job aggregates and uploads final `allure-report` and summaries

### Slack Notifications
- Block Kit with compact header, repo/commit context, status fields, top failures, and links
- Threading: start message returns thread ts; updates reply in-thread
- Dedupe: notify_start only once per run; updates suppressed unless significant (health passed)

### Flaky Tests Strategy
- Treat "failed then passed on retry" as flake (from Playwright JSON)
- Persist history JSON; compute 7-day summary and list of top suspect files
- Produce `reports/flaky-tests.json` and `reports/flaky-tests.md`

### Metrics to Track
- Duration, pass rate, fail count, flake count, top slow/failing specs (by file)

### Rollout Plan
1) Land workflow and scripts behind defaults (Slack token optional)
2) Validate on PR with sealion/leopard/jaguar envs
3) Tune retries, timeouts, and health checks; add owners mapping when CODEOWNERS is available

