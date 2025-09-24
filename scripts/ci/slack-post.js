#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (!next || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    }
  }
  return out;
}

function loadTemplate(name) {
  const p = path.join(__dirname, 'slack', 'templates', `${name}.json`);
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function render(template, vars) {
  const json = JSON.stringify(template);
  const rendered = json.replace(/\$\{(.*?)\}/g, (_, key) => vars[key] ?? '');
  return JSON.parse(rendered);
}

async function slackApi(method, body) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error('SLACK_BOT_TOKEN not set');
    process.exit(0);
  }
  const res = await fetch(`https://slack.com/api/${method}` , {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!data.ok) {
    console.error('Slack error:', JSON.stringify(data));
  }
  return data;
}

async function main() {
  const args = parseArgs();
  const template = args.template;
  if (!template) {
    console.error('Missing --template');
    process.exit(1);
  }

  const channel = process.env.SLACK_CHANNEL_ID;
  if (!channel) {
    console.error('SLACK_CHANNEL_ID not set');
    process.exit(0);
  }

  // Render variables
  const vars = {
    ref: args.ref || process.env.GITHUB_REF_NAME || '',
    repo: args.repo || process.env.GITHUB_REPOSITORY || '',
    workflow: args.workflow || process.env.GITHUB_WORKFLOW || '',
    concurrency: args.concurrency || '',
    runUrl: args['run-url'] || '',
    artifactsUrl: args['artifacts-url'] || '',
    allureUrl: args['allure-url'] || '',
    duration: args.duration || '',
    passed: args.passed || '',
    failed: args.failed || '',
    flaky: args.flaky || '',
    envSummary: args.envSummary || '',
    topFailures: args.topFailures || '',
    elapsed: args.elapsed || '',
    retriesStarted: args.retriesStarted || '',
    flakes: args.flakes || '',
    envBreakdown: args.envBreakdown || ''
  };

  const body = render(loadTemplate(template), vars);

  const thread = args.thread || process.env.THREAD_TS || '';

  let response;
  if (thread) {
    response = await slackApi('chat.postMessage', { channel, thread_ts: thread, ...body });
  } else {
    response = await slackApi('chat.postMessage', { channel, ...body });
  }

  // Output thread_ts for workflow use
  if (!thread && response && response.ts) {
    const output = process.env.GITHUB_OUTPUT;
    if (output) {
      fs.appendFileSync(output, `thread_ts=${response.ts}\n`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

