const Router = require('koa-router'),
  router = new Router(),
  moment = require('moment'),
  losslessJSON = require('lossless-json'),
  {
    TemporalClient,
    WithAuthMetadata,
    WithErrorConverter,
  } = require('./temporal-client'),
  { isWriteApiPermitted } = require('./utils'),
  { getAuthConfig, getRoutingConfig } = require('./config');
authRoutes = require('./routes-auth');

const tClient = WithErrorConverter(WithAuthMetadata(new TemporalClient()));

router.use('/auth', authRoutes);

router.get('/api/namespaces', async function(ctx) {
  ctx.body = await tClient.listNamespaces(ctx, {
    pageSize: 50,
    nextPageToken: ctx.query.nextPageToken
      ? Buffer.from(ctx.query.nextPageToken, 'base64')
      : undefined,
  });
});

router.get('/api/namespaces/:namespace', async function(ctx) {
  ctx.body = await tClient.describeNamespace(ctx, {
    namespace: ctx.params.namespace,
  });
});

async function listWorkflows(state, ctx) {
  const q = ctx.query || {};
  const startTime = moment(q.startTime || NaN);
  const endTime = moment(q.endTime || NaN);

  ctx.assert(startTime.isValid() && endTime.isValid(), 400);

  const { namespace } = ctx.params;

  ctx.body = await tClient[state + 'Workflows'](ctx, {
    namespace,
    startTime,
    endTime,
    typeFilter: q.workflowName ? { name: q.workflowName } : undefined,
    executionFilter: q.workflowId ? { workflowId: q.workflowId } : undefined,
    status: q.status || undefined,
    nextPageToken: q.nextPageToken
      ? Buffer.from(q.nextPageToken, 'base64')
      : undefined,
  });
}

router.get(
  '/api/namespaces/:namespace/workflows/open',
  listWorkflows.bind(null, 'open')
);
router.get(
  '/api/namespaces/:namespace/workflows/closed',
  listWorkflows.bind(null, 'closed')
);

router.get('/api/namespaces/:namespace/workflows/list', async function(ctx) {
  const q = ctx.query || {};

  const { namespace } = ctx.params;

  ctx.body = await tClient.listWorkflows(ctx, {
    namespace,
    query: q.queryString || undefined,
    nextPageToken: q.nextPageToken
      ? Buffer.from(q.nextPageToken, 'base64')
      : undefined,
  });
});

router.get(
  '/api/namespaces/:namespace/workflows/:workflowId/:runId/history',
  async function(ctx) {
    const q = ctx.query || {};

    const { namespace, workflowId, runId } = ctx.params;

    ctx.body = await tClient.getHistory(ctx, {
      namespace,
      execution: { workflowId, runId },
      nextPageToken: q.nextPageToken
        ? Buffer.from(q.nextPageToken, 'base64')
        : undefined,
      waitForNewEvent: 'waitForNewEvent' in q ? true : undefined,
    });
  }
);

const buildQueryString = (
  startTime,
  endTime,
  { status, workflowId, workflowName }
) => {
  return [
    `CloseTime >= "${startTime.toISOString()}"`,
    `CloseTime <= "${endTime.toISOString()}"`,
    status && `ExecutionStatus = "${status}"`,
    workflowId && `WorkflowID = "${workflowId}"`,
    workflowName && `WorkflowType = "${workflowName}"`,
  ]
    .filter((subQuery) => !!subQuery)
    .join(' and ');
};

router.get('/api/namespaces/:namespace/workflows/archived', async function(
  ctx
) {
  const { namespace } = ctx.params;
  const { nextPageToken, ...query } = ctx.query || {};
  let queryString;

  if (query.queryString) {
    queryString = query.queryString;
  } else {
    const startTime = moment(query.startTime || NaN);
    const endTime = moment(query.endTime || NaN);

    ctx.assert(startTime.isValid() && endTime.isValid(), 400);
    queryString = buildQueryString(startTime, endTime, query);
  }

  ctx.body = await tClient.archivedWorkflows(ctx, {
    namespace,
    nextPageToken: nextPageToken
      ? Buffer.from(nextPageToken, 'base64')
      : undefined,
    query: queryString,
  });
});

router.get(
  '/api/namespaces/:namespace/workflows/:workflowId/:runId/export',
  async function(ctx) {
    let nextPageToken;

    const { namespace, workflowId, runId } = ctx.params;

    do {
      const page = await tClient.exportHistory(ctx, {
        namespace,
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
  '/api/namespaces/:namespace/workflows/:workflowId/:runId/query',
  async function(ctx) {
    // workaround implementation until https://github.com/uber/cadence/issues/382 is resolved
    try {
      const { namespace, workflowId, runId } = ctx.params;

      await tClient.queryWorkflow(ctx, {
        namespace,
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
        .replace(/,/g, '')
        .split(' ')
        .filter((q) => q);
    }
  }
);

router.post(
  '/api/namespaces/:namespace/workflows/:workflowId/:runId/query/:queryType',
  async function(ctx) {
    const { namespace, workflowId, runId } = ctx.params;

    ctx.body = await tClient.queryWorkflow(ctx, {
      namespace,
      execution: { workflowId, runId },
      query: {
        queryType: ctx.params.queryType,
      },
    });
  }
);

router.post(
  '/api/namespaces/:namespace/workflows/:workflowId/:runId/terminate',
  async function(ctx) {
    const { namespace, workflowId, runId } = ctx.params;

    ctx.body = await tClient.terminateWorkflow(ctx, {
      namespace,
      execution: { workflowId, runId },
      reason: ctx.request.body && ctx.request.body.reason,
    });
  }
);

router.post(
  '/api/namespaces/:namespace/workflows/:workflowId/:runId/signal/:signal',
  async function(ctx) {
    const { namespace, workflowId, runId, signal } = ctx.params;

    ctx.body = await tClient.signalWorkflow(ctx, {
      namespace,
      execution: { workflowId, runId },
      signalName: signal,
    });
  }
);

router.get(
  '/api/namespaces/:namespace/workflows/:workflowId/:runId',
  async function(ctx) {
    const { namespace, workflowId, runId } = ctx.params;

    try {
      ctx.body = await tClient.describeWorkflow(ctx, {
        namespace,
        execution: { workflowId, runId },
      });
    } catch (error) {
      if (error.name !== 'NotFoundError') {
        throw error;
      }

      const archivedHistoryResponse = await tClient.getHistory();
      const archivedHistoryEvents = mapHistoryResponse(
        archivedHistoryResponse.history
      );

      if (!archivedHistoryEvents.length) {
        throw error;
      }

      const { runId, workflowId } = ctx.params;

      const {
        eventTime: startTime,
        details: {
          taskQueue,
          executionStartToCloseTimeoutSeconds,
          taskStartToCloseTimeoutSeconds,
          workflowType: type,
        },
      } = archivedHistoryEvents[0];

      ctx.body = {
        executionConfig: {
          taskQueue,
          executionStartToCloseTimeoutSeconds,
          taskStartToCloseTimeoutSeconds,
        },
        workflowExecutionInfo: {
          execution: {
            runId,
            workflowId,
          },
          isArchived: true,
          startTime,
          type,
        },
        pendingActivities: null,
        pendingChildren: null,
      };
    }
  }
);

router.get(
  '/api/namespaces/:namespace/task-queues/:taskQueue/pollers',
  async function(ctx) {
    const { namespace, taskQueue } = ctx.params;
    const descTaskQueue = async (taskQueueType) =>
      (
        await tClient.describeTaskQueue(ctx, {
          namespace,
          taskQueue: { name: taskQueue },
          taskQueueType,
        })
      ).pollers || [];

    const r = (type) => (o, poller) => {
      const i = o[poller.identity] || {};

      o[poller.identity] = {
        lastAccessTime:
          !i.lastAccessTime || i.lastAccessTime < poller.lastAccessTime
            ? poller.lastAccessTime
            : i.lastAccessTime,
        taskQueueTypes: i.taskQueueTypes
          ? i.taskQueueTypes.concat([type])
          : [type],
      };

      return o;
    };

    const activityL = await descTaskQueue('TASK_QUEUE_TYPE_ACTIVITY'),
      workflowL = await descTaskQueue('TASK_QUEUE_TYPE_WORKFLOW');

    ctx.body = activityL.reduce(
      r('activity'),
      workflowL.reduce(r('workflow'), {})
    );
  }
);

router.get('/api/namespaces/:namespace/task-queues/:taskQueue/', async function(
  ctx
) {
  const { namespace, taskQueue } = ctx.params;
  const descTaskQueue = async (taskQueueType) =>
    await tClient.describeTaskQueue(ctx, {
      namespace,
      taskQueue: { name: taskQueue },
      taskQueueType,
    });

  const activityQ = await descTaskQueue('TASK_QUEUE_TYPE_ACTIVITY');
  const workflowQ = await descTaskQueue('TASK_QUEUE_TYPE_WORKFLOW');

  const tq = { pollers: [...activityQ.pollers, ...workflowQ.pollers] };

  ctx.body = tq;
});

router.get('/api/web-settings', async (ctx) => {
  const routing = await getRoutingConfig();
  const { enabled } = await getAuthConfig();
  const permitWriteApi = isWriteApiPermitted();

  const auth = { enabled }; // only include non-sensitive data

  ctx.body = {
    routing,
    auth,
    permitWriteApi,
  };
});

router.get('/api/me', async (ctx) => {
  let user;
  if (ctx.isAuthenticated() && !!ctx.state.user) {
    const { email, name, picture } = ctx.state.user;
    user = { email, name, picture };
  }

  ctx.body = {
    user,
  };
});

router.get('/api/cluster/version-info', async (ctx) => {
  const res = await tClient.getVersionInfo(ctx);
  ctx.body = res;
});

module.exports = router;
