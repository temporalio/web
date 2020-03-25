const Router = require('koa-router'),
  router = new Router(),
  moment = require('moment'),
  Long = require('long'),
  losslessJSON = require('lossless-json'),
  momentToLong = m => Long.fromValue(m.unix()).mul(1000000000),
  WorkflowClient = require('./middleware/workflow-client');

const wfClient = new WorkflowClient();

router.get('/api/domains', async function(ctx) {
  ctx.body = await wfClient.listDomains({
    pageSize: 50,
    nextPageToken: ctx.query.nextPageToken
      ? Buffer.from(ctx.query.nextPageToken, 'base64')
      : undefined,
  });
});

router.get('/api/domains/:domain', async function(ctx) {
  ctx.body = await wfClient.describeDomain({ name: ctx.params.domain });
});

async function listWorkflows(state, ctx) {
  const q = ctx.query || {};
  const startTime = moment(q.startTime || NaN);
  const endTime = moment(q.endTime || NaN);

  ctx.assert(startTime.isValid() && endTime.isValid(), 400);

  const { domain } = ctx.params;

  ctx.body = await wfClient[state + 'Workflows']({
    domain,
    startTimeFilter: {
      earliestTime: momentToLong(startTime),
      latestTime: momentToLong(endTime),
    },
    typeFilter: q.workflowName ? { name: q.workflowName } : undefined,
    executionFilter: q.workflowId ? { workflowId: q.workflowId } : undefined,
    statusFilter: q.status || undefined,
    nextPageToken: q.nextPageToken
      ? Buffer.from(q.nextPageToken, 'base64')
      : undefined,
  });
}

router.get(
  '/api/domains/:domain/workflows/open',
  listWorkflows.bind(null, 'open')
);
router.get(
  '/api/domains/:domain/workflows/closed',
  listWorkflows.bind(null, 'closed')
);

router.get('/api/domains/:domain/workflows/list', async function(ctx) {
  const q = ctx.query || {};

  const { domain } = ctx.params;

  ctx.body = await wfClient.listWorkflows({
    domain,
    query: q.queryString || undefined,
    nextPageToken: q.nextPageToken
      ? Buffer.from(q.nextPageToken, 'base64')
      : undefined,
  });
});

router.get(
  '/api/domains/:domain/workflows/:workflowId/:runId/history',
  async function(ctx) {
    const q = ctx.query || {};

    const { domain, workflowId, runId } = ctx.params;

    ctx.body = await wfClient.getHistory({
      domain,
      execution: { workflowId, runId },
      nextPageToken: q.nextPageToken
        ? Buffer.from(q.nextPageToken, 'base64')
        : undefined,
      waitForNewEvent: 'waitForNewEvent' in q ? true : undefined,
    });
  }
);

router.get(
  '/api/domains/:domain/workflows/:workflowId/:runId/export',
  async function(ctx) {
    let nextPageToken;

    const { domain, workflowId, runId } = ctx.params;

    do {
      const page = await wfClient.exportHistory({
        domain,
        nextPageToken,
        execution: { workflowId, runId },
      });

      if (!nextPageToken) {
        ctx.status = 200;
      }

      ctx.res.write(
        (nextPageToken ? ',' : '[') +
          page.history.events.map(losslessJSON.stringify).join(',')
      );
      nextPageToken =
        page.nextPageToken && Buffer.from(page.nextPageToken, 'base64');
    } while (nextPageToken);

    ctx.res.write(']');
    ctx.body = '';
  }
);

router.get(
  '/api/domains/:domain/workflows/:workflowId/:runId/query',
  async function(ctx) {
    // workaround implementation until https://github.com/uber/cadence/issues/382 is resolved
    try {
      const { domain, workflowId, runId } = ctx.params;

      await wfClient.queryWorkflow({
        domain,
        execution: { workflowId, runId },
        query: {
          queryType: '__cadence_web_list',
        },
      });

      ctx.throw(500);
    } catch (e) {
      ctx.body = ((e.message || '').match(
        /(KnownQueryTypes|knownTypes)=\[(.*)\]/
      ) || [null, null, ''])[2]
        .split(' ')
        .filter(q => q);
    }
  }
);

router.post(
  '/api/domains/:domain/workflows/:workflowId/:runId/query/:queryType',
  async function(ctx) {
    const { domain, workflowId, runId } = ctx.params;

    ctx.body = await wfClient.queryWorkflow({
      domain,
      execution: { workflowId, runId },
      query: {
        queryType: ctx.params.queryType,
      },
    });
  }
);

router.post(
  '/api/domains/:domain/workflows/:workflowId/:runId/terminate',
  async function(ctx) {
    const { domain, workflowId, runId } = ctx.params;

    ctx.body = await wfClient.terminateWorkflow({
      domain,
      execution: { workflowId, runId },
      reason: ctx.request.body && ctx.request.body.reason,
    });
  }
);

router.post(
  '/api/domains/:domain/workflows/:workflowId/:runId/signal/:signal',
  async function(ctx) {
    const { domain, workflowId, runId, signal } = ctx.params;

    ctx.body = await wfClient.signalWorkflow({
      domain,
      execution: { workflowId, runId },
      signalName: signal,
    });
  }
);

router.get('/api/domains/:domain/workflows/:workflowId/:runId', async function(
  ctx
) {
  const { domain, workflowId, runId } = ctx.params;

  ctx.body = await wfClient.describeWorkflow({
    domain,
    execution: { workflowId, runId },
  });
});

router.get('/api/domains/:domain/task-lists/:taskList/pollers', async function(
  ctx
) {
  const { domain, taskList } = ctx.params;
  const descTaskList = async taskListType =>
    (
      await wfClient.describeTaskList({
        domain,
        taskList: { name: taskList },
        taskListType,
      })
    ).pollers || [];

  const r = type => (o, poller) => {
    const i = o[poller.identity] || {};

    o[poller.identity] = {
      lastAccessTime:
        !i.lastAccessTime || i.lastAccessTime < poller.lastAccessTime
          ? poller.lastAccessTime
          : i.lastAccessTime,
      taskListTypes: i.taskListTypes ? i.taskListTypes.concat([type]) : [type],
    };

    return o;
  };

  const activityL = await descTaskList('Activity'),
    decisionL = await descTaskList('Decision');

  ctx.body = activityL.reduce(
    r('activity'),
    decisionL.reduce(r('decision'), {})
  );
});

router.get('/health', ctx => (ctx.body = 'OK'));

module.exports = router;
