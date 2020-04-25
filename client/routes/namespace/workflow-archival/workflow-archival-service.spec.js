import moment from 'moment';

import WorkflowArchivalService from './workflow-archival-service';

describe('WorkflowArchivalService', () => {
  it('should make an API request when fetchArchivalRecords is called', async () => {
    const workflowArchivalService = WorkflowArchivalService({
      namespace: 'samples-namespace',
    });

    const closeTime = '2020-03-30T00:00:00Z';
    const startTime = '2020-03-01T00:00:00Z';

    fetch.mockResponseOnce(
      JSON.stringify({
        executions: [
          {
            closeStatus: 'closeStatusValue',
            closeTime,
            execution: {
              runId: 'runIdValue',
              workflowId: 'workflowIdValue',
            },
            startTime,
            type: {
              name: 'workflowNameValue',
            },
          },
        ],
        nextPageToken: 'nextPageTokenValue',
      })
    );
    const output = await workflowArchivalService.fetchArchivalRecords({
      query: 'queryString',
    });

    expect(output).toEqual({
      nextPageToken: 'nextPageTokenValue',
      results: [
        {
          closeStatus: 'closeStatusValue',
          closeTime: moment(closeTime).format('lll'),
          runId: 'runIdValue',
          startTime: moment(startTime).format('lll'),
          workflowId: 'workflowIdValue',
          workflowName: 'workflowNameValue',
        },
      ],
    });
  });
});
