# Slack Notification Examples

This document shows examples of the improved Slack notifications with the new Block Kit templates.

## Current vs. Proposed Comparison

### Current Problems
- **Verbose**: Multiple long messages per run
- **Repetitive**: Similar information repeated across messages  
- **No Threading**: Each message creates new channel entry
- **Poor Signal**: Important information buried in text
- **No Deduplication**: Duplicate messages for same events

### Proposed Solution
- **Concise**: Structured blocks with key info upfront
- **Threaded**: Single conversation per test run
- **Actionable**: Clear failure details and next steps
- **Visual**: Icons and formatting for quick scanning

---

## Example Message Templates

### 1. Start Notification (Thread Creator)

**Trigger:** Test workflow begins

```json
{
  "text": "🚀 E2E Tests Started - leopard",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text", 
        "text": "🚀 E2E Tests Started • leopard"
      }
    },
    {
      "type": "context",
      "elements": [
        {"type": "mrkdwn", "text": "*Repository:* Smokesignals"},
        {"type": "mrkdwn", "text": "*Trigger:* Pull Request"},
        {"type": "mrkdwn", "text": "*Test Types:* api"}
      ]
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*Commit:* <https://github.com/repo/commit/4077c1d|4077c1d>"},
        {"type": "mrkdwn", "text": "*Author:* john.doe"}
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View Progress"},
          "url": "https://github.com/repo/actions/runs/123",
          "style": "primary"
        }
      ]
    }
  ]
}
```

**Visual Result:**
```
🚀 E2E Tests Started • leopard

Repository: Smokesignals    Trigger: Pull Request    Test Types: api

Commit: 4077c1d             Author: john.doe

[View Progress]
```

---

### 2. Final Result - Success (Thread Reply)

**Trigger:** All tests complete successfully

```json
{
  "text": "✅ E2E Result - leopard - Passed",
  "thread_ts": "1642234567.123456",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "✅ E2E Result • leopard • Passed"
      }
    },
    {
      "type": "context", 
      "elements": [
        {"type": "mrkdwn", "text": "*Repository:* Smokesignals"},
        {"type": "mrkdwn", "text": "*Duration:* 18m"},
        {"type": "mrkdwn", "text": "*Run:* <https://github.com/repo/actions/runs/123|#123>"}
      ]
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*Passed*\n152"},
        {"type": "mrkdwn", "text": "*Failed*\n0"},
        {"type": "mrkdwn", "text": "*Flaky*\n1"},
        {"type": "mrkdwn", "text": "*Skipped*\n3"}
      ]
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "Run Details"},
          "url": "https://github.com/repo/actions/runs/123"
        },
        {
          "type": "button", 
          "text": {"type": "plain_text", "text": "Allure Report"},
          "url": "https://reports.example.com/123",
          "style": "primary"
        }
      ]
    }
  ]
}
```

**Visual Result:**
```
  ✅ E2E Result • leopard • Passed

  Repository: Smokesignals    Duration: 18m    Run: #123

  Passed    Failed    Flaky    Skipped
    152        0        1         3

  [Run Details]  [Allure Report]
```

---

### 3. Final Result - Failure (Thread Reply)

**Trigger:** Tests fail with detailed failure information

```json
{
  "text": "❌ E2E Result - leopard - Failed", 
  "thread_ts": "1642234567.123456",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "❌ E2E Result • leopard • Failed"
      }
    },
    {
      "type": "context",
      "elements": [
        {"type": "mrkdwn", "text": "*Repository:* Smokesignals"},
        {"type": "mrkdwn", "text": "*Duration:* 24m"},
        {"type": "mrkdwn", "text": "*Run:* <https://github.com/repo/actions/runs/123|#123>"}
      ]
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*Passed*\n149"},
        {"type": "mrkdwn", "text": "*Failed*\n3"},
        {"type": "mrkdwn", "text": "*Flaky*\n2"},
        {"type": "mrkdwn", "text": "*Skipped*\n1"}
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*Top Failures:*\n• `tests/checkout.spec.ts` — timeout at step 3\n• `tests/login.spec.ts` — 401 on /auth\n• `tests/campaign.spec.ts` — element not found"
      }
    },
    {
      "type": "section", 
      "text": {
        "type": "mrkdwn",
        "text": "*Flaky Tests:*\n• `tests/users.spec.ts` — intermittent timeout\n• `tests/segments.spec.ts` — race condition"
      }
    },
    {
      "type": "actions",
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "Run Details"},
          "url": "https://github.com/repo/actions/runs/123"
        },
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "Allure Report"}, 
          "url": "https://reports.example.com/123",
          "style": "primary"
        },
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "Artifacts"},
          "url": "https://github.com/repo/actions/runs/123/artifacts"
        }
      ]
    }
  ]
}
```

**Visual Result:**
```
  ❌ E2E Result • leopard • Failed

  Repository: Smokesignals    Duration: 24m    Run: #123

  Passed    Failed    Flaky    Skipped
    149        3        2         1

  Top Failures:
  • tests/checkout.spec.ts — timeout at step 3
  • tests/login.spec.ts — 401 on /auth  
  • tests/campaign.spec.ts — element not found

  Flaky Tests:
  • tests/users.spec.ts — intermittent timeout
  • tests/segments.spec.ts — race condition

  [Run Details]  [Allure Report]  [Artifacts]
```

---

### 4. Daily Digest

**Trigger:** Scheduled daily summary

```json
{
  "text": "📊 Daily E2E Digest - 2025-01-15",
  "blocks": [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "📊 Daily E2E Digest • 2025-01-15"
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn", 
        "text": "*Overall Health:* 🟡 Good\n*Environments Tested:* sealion, leopard, jaguar"
      }
    },
    {
      "type": "section",
      "fields": [
        {"type": "mrkdwn", "text": "*Total Tests*\n456"},
        {"type": "mrkdwn", "text": "*Success Rate*\n94.2%"},
        {"type": "mrkdwn", "text": "*Avg Duration*\n22m"},
        {"type": "mrkdwn", "text": "*Flaky Rate*\n4.1%"}
      ]
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*7-Day Trends:*\n📈 Success rate: +2.1%\n📉 Avg duration: -3m\n⚠️ New flaky tests: 2"
      }
    },
    {
      "type": "actions", 
      "elements": [
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "View Dashboard"},
          "url": "https://dashboard.example.com/e2e"
        },
        {
          "type": "button",
          "text": {"type": "plain_text", "text": "Flaky Report"},
          "url": "https://reports.example.com/flaky"
        }
      ]
    }
  ]
}
```

**Visual Result:**
```
📊 Daily E2E Digest • 2025-01-15

Overall Health: 🟡 Good
Environments Tested: sealion, leopard, jaguar

Total Tests    Success Rate    Avg Duration    Flaky Rate
    456           94.2%            22m           4.1%

7-Day Trends:
📈 Success rate: +2.1%
📉 Avg duration: -3m  
⚠️ New flaky tests: 2

[View Dashboard]  [Flaky Report]
```

---

## Threading Strategy

### Thread Flow Example

**Initial Message (Creates Thread):**
```
🚀 E2E Tests Started • leopard
Repository: Smokesignals    Trigger: Pull Request
[View Progress]
```

**Thread Replies:**
```
  ⏳ E2E Tests Running • leopard
  Duration: 12m    Progress: Health checks passed, running tests...
  [View Progress]

  ❌ E2E Result • leopard • Failed  
  Duration: 24m    Passed: 149    Failed: 3
  Top Failures: checkout timeout, login 401, campaign element not found
  [Run Details]  [Allure Report]  [Artifacts]
```

**Benefits:**
- Single conversation per test run
- Clear progression from start to finish  
- No channel spam
- Easy to follow test run history

---

## Deduplication Logic

### Scenario: Multiple Rapid Triggers

**Without Deduplication:**
```
🚀 E2E Tests Started • leopard (commit abc123)
🚀 E2E Tests Started • leopard (commit def456) 
🚀 E2E Tests Started • leopard (commit ghi789)
```

**With Deduplication:**
```
🚀 E2E Tests Started • leopard (commit abc123)
  ⏭️ Cancelled - newer commit def456 triggered
  
🚀 E2E Tests Started • leopard (commit def456)  
  ⏭️ Cancelled - newer commit ghi789 triggered
  
🚀 E2E Tests Started • leopard (commit ghi789)
  ✅ E2E Result • leopard • Passed
```

---

## Required Environment Variables

### GitHub Actions Secrets

```yaml
secrets:
  SLACK_WEBHOOK_URL: "https://hooks.slack.com/services/..."
  E2E_PAT: "ghp_..." # For commit status updates
  AWS_ACCESS_KEY_ID: "AKIA..."
  AWS_SECRET_ACCESS_KEY: "..."
  AWS_REGION: "us-east-1"
  AWS_S3_BUCKET: "e2e-reports-bucket"
  AWS_CLOUDFRONT_DISTRIBUTION: "https://d123.cloudfront.net"
```

### Usage in Workflows

```yaml
env:
  SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
  REPORT_URL: ${{ secrets.AWS_CLOUDFRONT_DISTRIBUTION }}/runs/${{ github.run_id }}/index.html
```

---

## Migration Strategy

### Phase 1: Parallel Deployment
- Deploy new templates alongside existing notifications
- Use feature flag to control which teams see new format
- Collect feedback and iterate

### Phase 2: Gradual Rollout  
- Enable threading for new notifications
- Migrate high-traffic environments first
- Monitor message volume reduction

### Phase 3: Full Migration
- Replace all old notification patterns
- Remove legacy notification code
- Implement advanced features (rate limiting, smart routing)

---

## Success Metrics

### Before Migration
- **Message Volume:** 4-6 messages per test run
- **Channel Noise:** High (frequent interruptions)  
- **Actionability:** Low (information buried in text)
- **Thread Usage:** None

### After Migration  
- **Message Volume:** 1-3 messages per test run (67% reduction)
- **Channel Noise:** Low (threaded conversations)
- **Actionability:** High (structured failure details)
- **Thread Usage:** 100% of test runs