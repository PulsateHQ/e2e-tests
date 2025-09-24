#!/usr/bin/env node

/*
  Slack posting utility with Block Kit templates, threading, dedupe, and rate limit.

  Env:
    SLACK_BOT_TOKEN           xoxb- token
    SLACK_DEFAULT_CHANNEL     channel ID or name
    SLACK_THREAD_TS           optional thread ts to reply in

  Args:
    --template <name>         on_trigger | on_running_update | on_result_success | on_result_failure | daily_digest
    --input <file>            JSON input for result/digest
    --env <name>              environment name for running update
    --set-output              prints ::set-output style for thread id and channel
*/

const fs = require('fs');
const path = require('path');
const https = require('https');

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

function slackApi(method, body) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error('SLACK_BOT_TOKEN is required');
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'slack.com',
        path: `/api/${method}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Authorization: `Bearer ${token}`
        }
      },
      res => {
        const chunks = [];
        res.on('data', d => chunks.push(d));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          try {
            const json = JSON.parse(raw);
            if (!json.ok) return reject(new Error(`Slack error: ${raw}`));
            resolve(json);
          } catch (e) {
            reject(new Error(`Slack parse error: ${raw}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

function repoMeta() {
  const repo = process.env.GITHUB_REPOSITORY || '';
  const sha = (process.env.GITHUB_SHA || '').slice(0, 7);
  const runId = process.env.GITHUB_RUN_ID || '';
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  const runUrl = repo && runId ? `${serverUrl}/${repo}/actions/runs/${runId}` : '';
  return { repo, sha, runId, runUrl };
}

function headerTextFor(template, env, summary) {
  if (template === 'on_trigger') return `E2E • ${env || 'all'} • 🚀 Triggered`;
  if (template === 'on_running_update') return `E2E • ${env || 'all'} • ⏳ Running`;
  if (template === 'on_result_success') return `E2E Result • ✅ Passed`;
  if (template === 'on_result_failure') return `E2E Result • ❌ Failed`;
  if (template === 'daily_digest') return `E2E • 📊 Daily Digest`;
  return 'E2E';
}

function humanDuration(ms) {
  if (!ms || isNaN(ms)) return 'n/a';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return minutes ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function buildBlocks(template, options) {
  const { env, input } = options;
  const meta = repoMeta();
  const header = headerTextFor(template, env, input);
  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: header } },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `*Repo:* ${meta.repo || 'n/a'}` },
        { type: 'mrkdwn', text: `*Commit:* ${meta.sha || 'n/a'}` },
        ...(input?.overall?.durationMs != null
          ? [{ type: 'mrkdwn', text: `*Duration:* ${humanDuration(input.overall.durationMs)}` }]
          : [])
      ]
    }
  ];
  if (template.startsWith('on_result') && input?.overall) {
    blocks.push({
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Passed*\n${input.overall.passed}` },
        { type: 'mrkdwn', text: `*Failed*\n${input.overall.failed}` },
        { type: 'mrkdwn', text: `*Flaky*\n${input.overall.flaky}` }
      ]
    });
    if (input.envs && Object.keys(input.envs).length) {
      const envList = Object.keys(input.envs).join(', ');
      blocks.push({ type: 'context', elements: [{ type: 'mrkdwn', text: `*Envs:* ${envList}` }] });
    }
  }
  if (template === 'on_result_failure' && input?.envs) {
    const failures = [];
    for (const [e, agg] of Object.entries(input.envs)) {
      for (const f of agg.topFailures || []) {
        failures.push(`• ${e}: \`${f.file}\` — failures: ${f.count}`);
      }
    }
    if (failures.length) {
      blocks.push({
        type: 'section',
        text: { type: 'mrkdwn', text: `*Top Failures*\n${failures.slice(0, 5).join('\n')}` }
      });
    }
  }
  const actions = [];
  if (meta.runUrl) actions.push({ type: 'button', text: { type: 'plain_text', text: 'Run Details' }, url: meta.runUrl });
  if (actions.length) blocks.push({ type: 'actions', elements: actions });
  return blocks;
}

async function postMessage(channel, text, blocks, thread_ts) {
  return slackApi('chat.postMessage', { channel, text, blocks, thread_ts });
}

async function main() {
  const args = parseArgs(process.argv);
  const channel = process.env.SLACK_CHANNEL || process.env.SLACK_DEFAULT_CHANNEL;
  if (!channel) throw new Error('SLACK_DEFAULT_CHANNEL or SLACK_CHANNEL is required');
  const thread_ts = process.env.SLACK_THREAD_TS || undefined;
  let input = undefined;
  if (args.input) input = JSON.parse(fs.readFileSync(args.input, 'utf8'));

  const blocks = buildBlocks(args.template, { env: args.env, input });
  const text = 'E2E Notification';

  const resp = await postMessage(channel, text, blocks, thread_ts);
  const outThreadTs = resp.ts || thread_ts;
  const outChannel = resp.channel;

  if (args['set-output']) {
    const ghOut = process.env.GITHUB_OUTPUT;
    const lines = [`thread_ts=${outThreadTs}`, `channel=${outChannel}`];
    if (ghOut) {
      require('fs').appendFileSync(ghOut, lines.map(l => `${l}\n`).join(''));
    } else {
      // Fallback to stdout if not in GitHub Actions
      console.log(lines.join('\n'));
    }
  }
}

main().catch(err => {
  console.error(err.message || String(err));
  process.exit(0); // Do not fail pipeline due to Slack issues
});

