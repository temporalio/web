import featureFlags from '../../../feature-flags.json';
import { mapFlagsToHash } from '../../../components/feature-flag/helpers';

export function applyJiraFormat(md) {
  return md
    // Convert markdown code blocks to Jira-compatible
    .replace(/```json/g, '{code:json}')
    .replace(/```/g, '{code}')
    // Convert markdown bold to Jira-compatible
    .replace(/\*\*/g, '*')
    // Remove heading since it goes under Jira ticket "Description"
    .replace('*Description*\n', '');
}

export function getReportIssueLink({
  workflow,
  workflowId = '',
  runId = '',
  input = '',
  result = '',
  href = '',
  flags,
}) {
  const flagHash = mapFlagsToHash(flags || featureFlags);
  const reportIssueFlag = flagHash['workflow-report-issue-url'];

  if (!(reportIssueFlag && workflow && input)) {
    return '';
  }

  const title = encodeURIComponent(
    `${workflow.workflowExecutionInfo.type.name} issue`
  );
  let body = `**Description**
A clear and concise description

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Workflow ID**
${workflowId}

**Run ID**
${runId}

**Input**

\`\`\`json
${input}
\`\`\`
${result &&
  `
**Result**

\`\`\`json
${result}
\`\`\`
`.trim()}

**Additional context**
Add any other context about the problem here.

**Link**
${href}`;

  // check if jira url, apply formatting
  if (reportIssueFlag.toLowerCase().indexOf('atlassian.net') >= 0) {
    body = applyJiraFormat(body);
  }

  return reportIssueFlag
    .replace('$title', title)
    .replace('$body', encodeURIComponent(body));
}
