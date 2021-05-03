const FLAG_WORKFLOW_REPORT_ISSUE_URL =
  process.env.FLAG_WORKFLOW_REPORT_ISSUE_URL || '';
const flagsFromEnv = {
  'workflow-report-issue-url': FLAG_WORKFLOW_REPORT_ISSUE_URL,
};

export const isFlagEnabled = ({ flagHash = {}, name = '' }) =>
  flagHash[name] || false;

export const mapFlagsToHash = (flagArray = []) => {
  return flagArray.reduce((accumulator, { key = '', value = false }) => {
    accumulator[key] = flagsFromEnv[key] || value;

    return accumulator;
  }, {});
};
