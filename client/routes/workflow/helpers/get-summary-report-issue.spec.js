import {
  applyJiraFormat,
  getReportIssueLink,
} from './get-summary-report-issue';

jest.mock('~helpers');

const GH_ENCODED_BODY = `**Description**%0AA%20clear%20and%20concise%20description%0A%0A**To%20Reproduce**%0ASteps%20to%20reproduce%20the%20behavior%3A%0A1.%20Go%20to%20'...'%0A2.%20Click%20on%20'....'%0A3.%20Scroll%20down%20to%20'....'%0A4.%20See%20error%0A%0A**Expected%20behavior**%0AA%20clear%20and%20concise%20description%20of%20what%20you%20expected%20to%20happen.%0A%0A**Workflow%20ID**%0AworkflowIdValue%0A%0A**Run%20ID**%0ArunIdValue%0A%0A**Input**%0A%0A%60%60%60json%0A%7B%7D%0A%60%60%60%0A%0A**Result**%0A%0A%60%60%60json%0A%7B%7D%0A%60%60%60%0A%0A**Additional%20context**%0AAdd%20any%20other%20context%20about%20the%20problem%20here.%0A%0A**Link**%0Ahttp%3A%2F%2Flocalhost%3A8088%2Fnamespaces%2Fdefault%2Fworkflows%2FworkflowIdValue%2FrunIdValue`;
// Apply Jira formatting
const JIRA_ENCODED_BODY = applyJiraFormat(GH_ENCODED_BODY);

describe('getReportIssueLink', () => {
  describe('When no feature flag', () => {
    it('should return an empty string.', () => {
      const output = getReportIssueLink({
        input: '{}',
        result: '{}',
        runId: 'runIdValue',
        workflowId: 'workflowIdValue',
        workflow: {
          workflowExecutionInfo: {
            type: { name: 'NamedWorkflow' },
          },
        },
        flags: [
          {
            key: 'workflow-report-issue-url',
            value: '',
          },
        ],
      });

      expect(output).toEqual('');
    });
  });

  describe('When feature flag is set', () => {
    let workflowId;
    let baseUrl;
    let runId;
    let props;

    beforeEach(() => {
      baseUrl = 'https://github.com/temporalio/temporal/issues/new';
      workflowId = 'workflowIdValue';
      runId = 'runIdValue';
      props = {
        href: `http://localhost:8088/namespaces/default/workflows/${workflowId}/${runId}`,
        input: '{}',
        result: '{}',
        workflow: {
          workflowExecutionInfo: {
            type: { name: 'NamedWorkflow' },
          },
        },
        flags: [
          {
            key: 'workflow-report-issue-url',
            value: baseUrl,
          },
        ],
      };
    });

    describe('without template variables', () => {
      it('should return as-is if it does not have templating variables.', () => {
        expect(
          getReportIssueLink({
            runId,
            workflowId,
            href: props.href,
            input: props.input,
            result: props.result,
            workflow: props.workflow,
            flags: props.flags,
          })
        ).toEqual(baseUrl);
      });
    });

    describe('github url with template variables', () => {
      beforeEach(() => {
        baseUrl = 'https://github.com/temporalio/temporal/issues/new';
        props.flags[0].value = baseUrl;
      });

      it('should replace $title variable if set.', () => {
        props.flags[0].value += '?template=bug_report.md&title=$title';
        expect(
          getReportIssueLink({
            runId,
            workflowId,
            href: props.href,
            input: props.input,
            result: props.result,
            workflow: props.workflow,
            flags: props.flags,
          })
        ).toEqual(
          'https://github.com/temporalio/temporal/issues/new?template=bug_report.md&title=NamedWorkflow%20issue'
        );
      });

      it('should replace $body variable if set.', () => {
        props.flags[0].value +=
          '?template=bug_report.md&title=$title&body=$body';
        expect(
          getReportIssueLink({
            runId,
            workflowId,
            href: props.href,
            input: props.input,
            result: props.result,
            workflow: props.workflow,
            flags: props.flags,
          })
        ).toEqual(
          `https://github.com/temporalio/temporal/issues/new?template=bug_report.md&title=NamedWorkflow%20issue&body=${GH_ENCODED_BODY}`
        );
      });
    });

    describe('jira url with template variables', () => {
      beforeEach(() => {
        baseUrl =
          'https://example.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10000&issuetype=10010&summary=$title';
        props.flags[0].value = baseUrl;
      });

      it('should replace $title variable if set.', () => {
        expect(
          getReportIssueLink({
            runId,
            workflowId,
            href: props.href,
            input: props.input,
            result: props.result,
            workflow: props.workflow,
            flags: props.flags,
          })
        ).toEqual(
          'https://example.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10000&issuetype=10010&summary=NamedWorkflow%20issue'
        );
      });

      it('should replace $body variable if set.', () => {
        props.flags[0].value += '&description=$body';
        expect(
          getReportIssueLink({
            runId,
            workflowId,
            href: props.href,
            input: props.input,
            result: props.result,
            workflow: props.workflow,
            flags: props.flags,
          })
        ).toEqual(
          `https://example.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10000&issuetype=10010&summary=NamedWorkflow%20issue&description=${JIRA_ENCODED_BODY}`
        );
      });
    });
  });
});
