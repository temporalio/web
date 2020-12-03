const grpc = require('grpc');
const bluebird = require('bluebird');
const protoLoader = require('@grpc/proto-loader');
const utils = require('../utils');
const { getCredentials } = require('../tls');
const {
  buildGrpcMetadata,
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
  { namespace },
  metadata
) {
  const req = { namespace };

  const res = await this.client.describeNamespaceAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res);
};

TemporalClient.prototype.listNamespaces = async function(
  { pageSize, nextPageToken },
  metadata
) {
  const req = { pageSize, nextPageToken };

  const res = await this.client.listNamespacesAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res);
};

TemporalClient.prototype.openWorkflows = async function(
  {
    namespace,
    startTime,
    endTime,
    executionFilter,
    typeFilter,
    nextPageToken,
    maximumPageSize = 100,
  },
  metadata
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
  const res = await this.client.listOpenWorkflowExecutionsAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res);
};

TemporalClient.prototype.closedWorkflows = async function(
  {
    namespace,
    startTime,
    endTime,
    executionFilter,
    typeFilter,
    status,
    nextPageToken,
    maximumPageSize = 100,
  },
  metadata
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

  const res = await this.client.listClosedWorkflowExecutionsAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res);
};

TemporalClient.prototype.listWorkflows = async function(
  { namespace, query, nextPageToken, pageSize = 20, maximumPageSize = 100 },
  metadata
) {
  const req = {
    namespace,
    query,
    nextPageToken,
    pageSize,
    maximumPageSize,
  };

  const res = await this.client.listWorkflowExecutionsAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res);
};

TemporalClient.prototype.getHistory = async function(
  {
    namespace,
    nextPageToken,
    execution,
    waitForNewEvent,
    maximumPageSize = 100,
  },
  metadata
) {
  const req = {
    namespace,
    nextPageToken,
    execution: buildWorkflowExecutionRequest(execution),
    waitForNewEvent,
    maximumPageSize,
  };

  const res = await this.client.getWorkflowExecutionHistoryAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  if (res.history && res.history.events) {
    res.history = buildHistory(res);
  }

  return uiTransform(res);
};

TemporalClient.prototype.archivedWorkflows = async function(
  { namespace, nextPageToken, query, pageSize = 100 },
  metadata
) {
  const req = {
    namespace,
    nextPageToken,
    query,
    pageSize,
  };

  const res = await this.client.listArchivedWorkflowExecutionsAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res);
};

TemporalClient.prototype.exportHistory = async function(
  { namespace, execution, nextPageToken },
  metadata
) {
  const req = {
    namespace,
    execution: buildWorkflowExecutionRequest(execution),
    nextPageToken,
  };

  const res = await this.client.getWorkflowExecutionHistoryAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return cliTransform(res);
};

TemporalClient.prototype.queryWorkflow = async function(
  { namespace, execution, query },
  metadata
) {
  const req = {
    namespace,
    execution: buildWorkflowExecutionRequest(execution),
    query,
  };
  const res = await this.client.queryWorkflowAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res);
};

TemporalClient.prototype.terminateWorkflow = async function(
  { namespace, execution, reason },
  metadata
) {
  if (!utils.isWriteApiPermitted()) {
    throw Error('Terminate method is disabled');
  }

  const req = {
    namespace,
    workflowExecution: buildWorkflowExecutionRequest(execution),
    reason,
  };

  const res = await this.client.terminateWorkflowExecutionAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res);
};

TemporalClient.prototype.signalWorkflow = async function(
  { namespace, execution, signal },
  metadata
) {
  const req = {
    namespace,
    workflowExecution: buildWorkflowExecutionRequest(execution),
    signal,
  };

  const res = await this.client.signalWorkflowExecutionAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res);
};

TemporalClient.prototype.describeWorkflow = async function(
  { namespace, execution },
  metadata
) {
  const req = {
    namespace,
    execution: buildWorkflowExecutionRequest(execution),
  };

  const res = await this.client.describeWorkflowExecutionAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res);
};

TemporalClient.prototype.describeTaskQueue = async function(
  { namespace, taskQueue, taskQueueType },
  metadata
) {
  const req = { namespace, taskQueue, taskQueueType };
  const res = await this.client.describeTaskQueueAsync(
    req,
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res);
};

TemporalClient.prototype.getVersionInfo = async function(metadata) {
  const res = await this.client.getClusterInfoAsync(
    {},
    buildGrpcMetadata(metadata)
  );

  return uiTransform(res.versionInfo);
};

module.exports = { TemporalClient };
