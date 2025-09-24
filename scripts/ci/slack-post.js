#!/usr/bin/env node

/**
 * Slack notification posting script
 * Usage: node slack-post.js --template <template> [--thread-ts <ts>] [--input <file>]
 */

const fs = require('fs');
const path = require('path');

function generateSlackPayload(template, context = {}) {
  const templates = {
    start: generateStartTemplate,
    running: generateRunningTemplate,
    result: generateResultTemplate,
    daily_digest: generateDailyDigestTemplate
  };

  const generator = templates[template];
  if (!generator) {
    throw new Error(`Unknown template: ${template}`);
  }

  return generator(context);
}

function generateStartTemplate(context) {
  const { environments, testTypes, trigger, commitInfo } = context;
  
  const envList = Array.isArray(environments) ? environments.join(', ') : environments;
  const typeList = Array.isArray(testTypes) ? testTypes.join(', ') : testTypes;
  
  const triggerText = trigger === 'schedule' ? 'Scheduled Daily Run' : 
                     trigger === 'repository_dispatch' ? 'Manual Trigger' :
                     trigger === 'pull_request' ? 'Pull Request' : 'Push to Main';

  return {
    text: `🚀 E2E Tests Started - ${envList}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🚀 E2E Tests Started • ${envList}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*Repository:* ${context.repository || 'Smokesignals'}`
          },
          {
            type: "mrkdwn",
            text: `*Trigger:* ${triggerText}`
          },
          {
            type: "mrkdwn",
            text: `*Test Types:* ${typeList}`
          }
        ]
      },
      ...(commitInfo ? [{
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Commit:* <${commitInfo.url}|${commitInfo.sha?.substring(0, 7)}>`
          },
          {
            type: "mrkdwn",
            text: `*Author:* ${commitInfo.author}`
          }
        ]
      }] : []),
      ...(commitInfo?.message ? [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Message:* ${commitInfo.message.substring(0, 200)}${commitInfo.message.length > 200 ? '...' : ''}`
        }
      }] : []),
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Progress"
            },
            url: context.runUrl,
            style: "primary"
          }
        ]
      }
    ]
  };
}

function generateRunningTemplate(context) {
  const { environments, progress, duration } = context;
  
  return {
    text: `⏳ E2E Tests Running - ${environments}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `⏳ E2E Tests Running • ${environments}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `*Duration:* ${duration}`
          },
          {
            type: "mrkdwn",
            text: `*Progress:* ${progress}`
          }
        ]
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Progress"
            },
            url: context.runUrl
          }
        ]
      }
    ]
  };
}

function generateResultTemplate(context) {
  const { summary, reportUrl, environments } = context;
  
  const statusEmoji = summary.overallStatus === 'success' ? '✅' : '❌';
  const statusText = summary.overallStatus === 'success' ? 'Passed' : 'Failed';
  
  const envList = Array.isArray(environments) ? environments.join(', ') : environments;
  
  const duration = formatDuration(summary.totals.duration);
  
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${statusEmoji} E2E Result • ${envList} • ${statusText}`
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `*Repository:* ${context.repository || 'Smokesignals'}`
        },
        {
          type: "mrkdwn",
          text: `*Duration:* ${duration}`
        },
        {
          type: "mrkdwn",
          text: `*Run:* <${context.runUrl}|#${context.runId}>`
        }
      ]
    }
  ];

  // Add commit info if available
  if (context.commitInfo) {
    blocks.push({
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*Commit:* <${context.commitInfo.url}|${context.commitInfo.sha?.substring(0, 7)}>`
        },
        {
          type: "mrkdwn",
          text: `*Author:* ${context.commitInfo.author}`
        }
      ]
    });
  }

  // Test results summary
  blocks.push({
    type: "section",
    fields: [
      {
        type: "mrkdwn",
        text: `*Passed*\n${summary.totals.passed}`
      },
      {
        type: "mrkdwn",
        text: `*Failed*\n${summary.totals.failed}`
      },
      {
        type: "mrkdwn",
        text: `*Flaky*\n${summary.totals.flaky}`
      },
      {
        type: "mrkdwn",
        text: `*Skipped*\n${summary.totals.skipped}`
      }
    ]
  });

  // Environment breakdown
  if (Object.keys(summary.environments).length > 1) {
    const envFields = Object.entries(summary.environments).map(([env, data]) => {
      const envStatus = data.totals.failed > 0 ? '❌' : 
                       !data.healthCheck ? '🏥' : '✅';
      return {
        type: "mrkdwn",
        text: `*${env}*\n${envStatus} ${data.totals.passed}/${data.totals.passed + data.totals.failed}`
      };
    });
    
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Environment Results:*"
      },
      fields: envFields.slice(0, 10) // Limit to 10 fields
    });
  }

  // Top failures
  if (summary.failures && summary.failures.length > 0) {
    const failureText = summary.failures.slice(0, 3).map(failure => 
      `• \`${failure.file}\` — ${failure.error.substring(0, 80)}${failure.error.length > 80 ? '...' : ''}`
    ).join('\n');
    
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Top Failures:*\n${failureText}`
      }
    });
  }

  // Flaky tests
  if (summary.flaky && summary.flaky.length > 0) {
    const flakyText = summary.flaky.slice(0, 2).map(flaky =>
      `• \`${flaky.file}\` — ${flaky.title}`
    ).join('\n');
    
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Flaky Tests:*\n${flakyText}`
      }
    });
  }

  // Actions
  const actions = [
    {
      type: "button",
      text: {
        type: "plain_text",
        text: "Run Details"
      },
      url: context.runUrl
    }
  ];

  if (reportUrl) {
    actions.push({
      type: "button",
      text: {
        type: "plain_text",
        text: "Allure Report"
      },
      url: reportUrl,
      style: "primary"
    });
  }

  blocks.push({
    type: "actions",
    elements: actions
  });

  return {
    text: `${statusEmoji} E2E Result - ${envList} - ${statusText}`,
    blocks
  };
}

function generateDailyDigestTemplate(context) {
  const { date, environments, summary } = context;
  
  return {
    text: `📊 Daily E2E Digest - ${date}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `📊 Daily E2E Digest • ${date}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Overall Health:* ${summary.overallHealth}\n*Environments Tested:* ${environments.join(', ')}`
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Total Tests*\n${summary.totalTests}`
          },
          {
            type: "mrkdwn",
            text: `*Success Rate*\n${summary.successRate}%`
          },
          {
            type: "mrkdwn",
            text: `*Avg Duration*\n${summary.avgDuration}`
          },
          {
            type: "mrkdwn",
            text: `*Flaky Rate*\n${summary.flakyRate}%`
          }
        ]
      },
      ...(summary.trends ? [{
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*7-Day Trends:*\n${summary.trends}`
        }
      }] : []),
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Dashboard"
            },
            url: context.dashboardUrl
          }
        ]
      }
    ]
  };
}

function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const templateIndex = args.indexOf('--template');
  const threadIndex = args.indexOf('--thread-ts');
  const inputIndex = args.indexOf('--input');
  
  if (templateIndex === -1 || templateIndex + 1 >= args.length) {
    console.error('Usage: node slack-post.js --template <template> [--thread-ts <ts>] [--input <file>]');
    process.exit(1);
  }
  
  const template = args[templateIndex + 1];
  const threadTs = threadIndex !== -1 && threadIndex + 1 < args.length ? args[threadIndex + 1] : null;
  const inputFile = inputIndex !== -1 && inputIndex + 1 < args.length ? args[inputIndex + 1] : null;
  
  let context = {};
  
  // Load context from input file if provided
  if (inputFile && fs.existsSync(inputFile)) {
    try {
      context = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    } catch (error) {
      console.error(`Error reading input file: ${error.message}`);
      process.exit(1);
    }
  }
  
  // Add environment variables to context
  context.runUrl = context.runUrl || `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  context.runId = context.runId || process.env.GITHUB_RUN_ID;
  context.repository = context.repository || process.env.GITHUB_REPOSITORY?.split('/')[1];
  
  try {
    const payload = generateSlackPayload(template, context);
    
    if (threadTs) {
      payload.thread_ts = threadTs;
    }
    
    console.log(JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error(`Error generating payload: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { generateSlackPayload };