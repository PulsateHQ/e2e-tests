## E2E CI Audit and Proposal

### Current
- Playwright with Allure reporter enabled; retries=1, workers=1, Firefox/Chrome/Safari projects configured; UI tests only in `sealion` via env gating.
- npm scripts run per-env using dotenv files (`.env.<env>`).
- README references Slack and Allure, but no existing workflow files present in repo root at time of audit.

### Issues
- Slack messages historically were noisy and duplicative, lacking threading and clear drill-downs.
- Artifacts could be inconsistent across failures; Allure results not always uploaded before Slack posts.
- Jobs not split into explicit prepare → test → report stages.

### Proposed Architecture

```
GitHub Actions: e2e
  prepare (start Slack thread) -> test [matrix env={sealion,leopard,jaguar}] -> report (final Slack + flakes)
```

Key aspects:
- Prepare installs deps and browsers; posts a single Start message and emits thread_ts.
- Test jobs run per environment with health check first, then E2E. Always upload Allure, Playwright JSON, traces, screenshots, videos, and per-env summary.json.
- Report job aggregates all summaries, generates flaky-tests.json/md, and posts a single compact result message in the original Slack thread.

### Improvements
- Matrices collapse duplicated jobs across environments.
- Concurrency per ref/workflow with cancel-in-progress.
- Reliable caching using `actions/setup-node` cache on lockfile + Playwright action for browsers.
- Artifacts: Allure results, Playwright report JSON, and test-results directories uploaded with retention.
- Slack: Block Kit templates, single thread per run, dedupe start, final result only after artifacts are ready.
- Permissions: minimal `contents: read`.
- Timeouts and fail-fast on health-check step.

### Metrics to Track
- Duration per env and total
- Pass/fail counts and flake count (retries)
- Top failing specs
- Flake trend (count per day)

### Rollout Plan
1. Land workflow and scripts in PR. Verify in a dry run on a non-critical branch.
2. Add Slack secrets (`SLACK_BOT_TOKEN`, `SLACK_CHANNEL_ID`).
3. Iterate templates and owners mapping as CODEOWNERS becomes available.

### Secrets and Env Vars
- `SLACK_BOT_TOKEN`: Bot token with `chat:write` scope
- `SLACK_CHANNEL_ID`: Target channel ID for posting
- Optional future additions: `ALLURE_BASE_URL` for hosted dashboards

### Example Slack Messages

Triggered (thread root): concise start with run link.

Running update: only if >10m elapsed or retries.

Result (success): compact totals and links.

Result (failure): includes top failures and artifacts.


