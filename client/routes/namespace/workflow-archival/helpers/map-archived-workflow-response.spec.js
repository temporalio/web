import moment from 'moment';

import mapArchivedWorkflowResponse from './map-archived-workflow-response';

describe('mapArchivedWorkflowResponse', () => {
  it('should return nextPageToken = "123" when passed nextPageToken = "123".', () => {
    const nextPageToken = '123';
    const output = mapArchivedWorkflowResponse({ nextPageToken });

    expect(output.nextPageToken).toEqual('123');
  });

  it('should return a flattened results array when passed executions with 1 item', () => {
    const closeTime = '2020-03-30T00:00:00Z';
    const startTime = '2020-03-01T00:00:00Z';

    const executions = [
      {
        closeStatus: 'closeStatusValue',
        closeTime: '2020-03-30T00:00:00Z',
        execution: {
          runId: 'runIdValue',
          workflowId: 'workflowIdValue',
        },
        startTime: '2020-03-01T00:00:00Z',
        type: {
          name: 'workflowNameValue',
        },
      },
    ];
    const output = mapArchivedWorkflowResponse({ executions });

    expect(output.results[0].closeStatus).toEqual('closeStatusValue');
    expect(output.results[0].closeTime).toEqual(
      moment(closeTime).format('lll')
    );
    expect(output.results[0].runId).toEqual('runIdValue');
    expect(output.results[0].startTime).toEqual(
      moment(startTime).format('lll')
    );
    expect(output.results[0].workflowId).toEqual('workflowIdValue');
    expect(output.results[0].workflowName).toEqual('workflowNameValue');
  });
});
