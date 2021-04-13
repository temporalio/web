const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const bluebird = require('bluebird');
const utils = require('../utils');
const { getCredentials } = require('../tls');
const {
  buildHistory,
  buildWorkflowExecutionRequest,
  momentToProtoTime,
  uiTransform,
  cliTransform,
} = require('./helpers');

function TemporalClient() {
  const dir = process.cwd();
  const protoFileName = 'service.proto';
  const options = {
    keepCase: false,
    longs: String,
    enums: String,
    bytes: String,
    defaults: true,
    oneofs: true,
    includeDirs: [
      `${dir}/proto/`,
      `${dir}/proto/temporal/api/command/v1`,
      `${dir}/proto/temporal/api/common/v1`,
      `${dir}/proto/temporal/api/enums/v1`,
      `${dir}/proto/temporal/api/errordetails/v1`,
      `${dir}/proto/temporal/api/failure/v1`,
      `${dir}/proto/temporal/api/filter/v1`,
      `${dir}/proto/temporal/api/history/v1`,
      `${dir}/proto/temporal/api/namespace/v1`,
      `${dir}/proto/temporal/api/query/v1`,
      `${dir}/proto/temporal/api/replication/v1`,
      `${dir}/proto/temporal/api/taskqueue/v1`,
      `${dir}/proto/temporal/api/version/v1`,
      `${dir}/proto/temporal/api/workflow/v1`,
      `${dir}/proto/temporal/api/workflowservice/v1`,
    ],
  };

  const packageDefinition = protoLoader.loadSync(protoFileName, options);
  const service = grpc.loadPackageDefinition(packageDefinition);

  const { credentials: tlsCreds, options: tlsOpts } = getCredentials();

  let client = new service.temporal.api.workflowservice.v1.WorkflowService(
    process.env.TEMPORAL_GRPC_ENDPOINT || '127.0.0.1:7233',
    tlsCreds,
    tlsOpts
  );

  client = bluebird.promisifyAll(client);
  this.client = client;
}

TemporalClient.prototype.describeNamespace = async function(
  ctx,
  { namespace }
) {
  const req = { namespace };

  const res = await this.client.describeNamespaceAsync(ctx, req);

  return uiTransform(res);
};

TemporalClient.prototype.listNamespaces = async function(
  ctx,
  { pageSize, nextPageToken }
) {
  const req = { pageSize, nextPageToken };

  const res = await this.client.listNamespacesAsync(ctx, req);

  return uiTransform(res);
};

TemporalClient.prototype.openWorkflows = async function(
  ctx,
  {
    namespace,
    startTime,
    endTime,
    executionFilter,
    typeFilter,
    nextPageToken,
    maximumPageSize = 100,
  }
) {
  const startTimeFilter = {
    earliestTime: momentToProtoTime(startTime),
    latestTime: momentToProtoTime(endTime),
  };
  const req = {
    namespace,
    nextPageToken,
    maximumPageSize,
    startTimeFilter,
    typeFilter,
    executionFilter,
  };
  const res = await this.client.listOpenWorkflowExecutionsAsync(ctx, req);

  return uiTransform(res);
};

TemporalClient.prototype.closedWorkflows = async function(
  ctx,
  {
    namespace,
    startTime,
    endTime,
    executionFilter,
    typeFilter,
    status,
    nextPageToken,
    maximumPageSize = 100,
  }
) {
  const startTimeFilter = {
    earliestTime: momentToProtoTime(startTime),
    latestTime: momentToProtoTime(endTime),
  };
  const req = {
    namespace,
    nextPageToken,
    maximumPageSize,
    startTimeFilter,
    executionFilter,
    typeFilter,
    statusFilter: status ? { status } : undefined,
  };

  const res = await this.client.listClosedWorkflowExecutionsAsync(ctx, req);

  return uiTransform(res);
};

TemporalClient.prototype.listWorkflows = async function(
  ctx,
  { namespace, query, nextPageToken, pageSize = 20, maximumPageSize = 100 }
) {
  const req = {
    namespace,
    query,
    nextPageToken,
    pageSize,
    maximumPageSize,
  };

  const res = await this.client.listWorkflowExecutionsAsync(ctx, req);

  return uiTransform(res);
};

TemporalClient.prototype.getHistory = async function(
  ctx,
  {
    namespace,
    nextPageToken,
    execution,
    waitForNewEvent,
    rawPayloads,
    maximumPageSize = 100,
  }
) {
  const req = {
    namespace,
    nextPageToken,
    execution: buildWorkflowExecutionRequest(execution),
    waitForNewEvent,
    maximumPageSize,
  };

  let res = await this.client.getWorkflowExecutionHistoryAsync(ctx, req);

  res = uiTransform(res, rawPayloads);

  if (res.history && res.history.events) {
    res.history = buildHistory(res);
  }

  return res;
};

TemporalClient.prototype.archivedWorkflows = async function(
  ctx,
  { namespace, nextPageToken, query, pageSize = 100 }
) {
  const req = {
    namespace,
    nextPageToken,
    query,
    pageSize,
  };

  const res = await this.client.listArchivedWorkflowExecutionsAsync(ctx, req);

  return uiTransform(res);
};

TemporalClient.prototype.exportHistory = async function(
  ctx,
  { namespace, execution, nextPageToken }
) {
  const req = {
    namespace,
    execution: buildWorkflowExecutionRequest(execution),
    nextPageToken,
  };

  const res = await this.client.getWorkflowExecutionHistoryAsync(ctx, req);

  return cliTransform(res);
};

TemporalClient.prototype.queryWorkflow = async function(
  ctx,
  { namespace, execution, query }
) {
  const req = {
    namespace,
    execution: buildWorkflowExecutionRequest(execution),
    query,
  };
  const res = await this.client.queryWorkflowAsync(ctx, req);

  return uiTransform(res);
};

TemporalClient.prototype.terminateWorkflow = async function(
  ctx,
  { namespace, execution, reason }
) {
  if (!utils.isWriteApiPermitted()) {
    throw Error('Terminate method is disabled');
  }

  const req = {
    namespace,
    workflowExecution: buildWorkflowExecutionRequest(execution),
    reason,
  };

  const res = await this.client.terminateWorkflowExecutionAsync(ctx, req);

  return uiTransform(res);
};

TemporalClient.prototype.signalWorkflow = async function(
  ctx,
  { namespace, execution, signal }
) {
  const req = {
    namespace,
    workflowExecution: buildWorkflowExecutionRequest(execution),
    signal,
  };

  const res = await this.client.signalWorkflowExecutionAsync(ctx, req);

  return uiTransform(res);
};

TemporalClient.prototype.describeWorkflow = async function(
  ctx,
  { namespace, execution }
) {
  const req = {
    namespace,
    execution: buildWorkflowExecutionRequest(execution),
  };

  const res = await this.client.describeWorkflowExecutionAsync(ctx, req);

  return uiTransform(res);
};

TemporalClient.prototype.describeTaskQueue = async function(
  ctx,
  { namespace, taskQueue, taskQueueType }
) {
  const req = { namespace, taskQueue, taskQueueType };
  const res = await this.client.describeTaskQueueAsync(ctx, req);

  return uiTransform(res);
};

TemporalClient.prototype.getVersionInfo = async function(ctx) {
  const res = await this.client.getClusterInfoAsync(ctx, {});

  return uiTransform(res.versionInfo);
};

module.exports = { TemporalClient };
