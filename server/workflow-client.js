const grpc = require('grpc');
const bluebird = require('bluebird');

const common = require('./grpc/common/common_pb');
const common_execution = require('./grpc/common/workflow_execution_pb');
const enums = require('./grpc/enums/enums_pb');
const messages = require('./grpc/workflowservice/request_response_pb');
const services = require('./grpc/workflowservice/service_grpc_pb');

function WorkflowClient() {
  let client = new services.WorkflowServiceClient(
    process.env.TEMPORAL_GRPC_ENDPOINT || '127.0.0.1:7233',
    grpc.credentials.createInsecure()
  );

  client = bluebird.promisifyAll(client);
  this.client = client;
}

WorkflowClient.prototype.describeDomain = async function({ name }) {
  const req = new messages.DescribeDomainRequest();

  req.setName(name);
  const res = await this.client.describeDomainAsync(req);

  return res.toObject();
};

WorkflowClient.prototype.listDomains = async function({
  pageSize,
  nextPageToken,
}) {
  const req = new messages.ListDomainsRequest();

  req.setPagesize(pageSize);
  req.setNextpagetoken(nextPageToken);
  const res = await this.client.listDomainsAync(req);

  return res.toObject();
};

WorkflowClient.prototype.openWorkflows = async function({
  domain,
  startTimeFilter,
  typeFilter,
  executionFilter,
  nextPageToken,
  maximumPageSize = 100,
}) {
  const wfTimeFilter = new common.StartTimeFilter();
  const req = new messages.ListOpenWorkflowExecutionsRequest();

  req.setDomain(domain);
  wfTimeFilter.setEarliesttime(startTimeFilter.earliestTime);
  wfTimeFilter.setLatesttime(startTimeFilter.latestTime);
  req.setStarttimefilter(wfTimeFilter);
  req.setNextpagetoken(nextPageToken);
  req.setMaximumpagesize(maximumPageSize);
  setTypeFilter(req, { typeFilter });
  setWorkflowExecutionFilter(req, executionFilter);

  const res = await this.client.listOpenWorkflowExecutionsAsync(req);

  return res.toObject();
};

WorkflowClient.prototype.closedWorkflows = async function({
  domain,
  startTimeFilter,
  typeFilter,
  executionFilter,
  statusFilter,
  nextPageToken,
  maximumPageSize = 100,
}) {
  const wfTimeFilter = new common.StartTimeFilter();
  const req = new messages.ListClosedWorkflowExecutionsRequest();

  req.setDomain(domain);
  wfTimeFilter.setEarliesttime(startTimeFilter.earliestTime);
  wfTimeFilter.setLatesttime(startTimeFilter.latestTime);
  req.setStarttimefilter(wfTimeFilter);
  req.setNextpagetoken(nextPageToken);
  req.setMaximumpagesize(maximumPageSize);
  setTypeFilter(req, typeFilter);
  setWorkflowExecutionFilter(req, executionFilter);
  setStatusFilter(req, statusFilter);

  const res = await this.client.listClosedWorkflowExecutionsAsync(req);

  return res.toObject();
};

WorkflowClient.prototype.listWorkflows = async function({
  domain,
  query,
  nextPageToken,
  pageSize = 20,
  maximumPageSize = 100,
}) {
  const req = new messages.ListWorkflowExecutionsRequest();

  req.setDomain(domain);
  req.setNextpagetoken(nextPageToken);
  req.setPagesize(pageSize);
  req.setMaximumpagesize(maximumPageSize);
  req.setQuery(query);

  const res = await this.client.ListWorkflowExecutionsAsync(req);

  return res.toObject();
};

WorkflowClient.prototype.getHistory = async function({
  domain,
  nextPageToken,
  executionFilter,
  waitForNewEvent,
  maximumPageSize = 100,
}) {
  const req = new messages.GetWorkflowExecutionHistoryRequest();

  req.setDomain(domain);
  req.setMaximumpagesize(maximumPageSize);
  req.setNextpagetoken(nextPageToken);
  setWorkflowExecution(req, executionFilter);

  if (waitForNewEvent !== undefined) {
    req.setWaitfornewevent(waitForNewEvent);
  }

  const res = await this.client.GetWorkflowExecutionHistoryAsync(req);

  return res.toObject();
};

WorkflowClient.prototype.exportHistory = async function({
  domain,
  executionFilter,
  nextPageToken,
}) {
  const req = new messages.GetWorkflowExecutionHistoryRequest();

  req.setDomain(domain);
  req.setNextpagetoken(nextPageToken);
  setWorkflowExecution(req, executionFilter);

  const res = await this.client.GetWorkflowExecutionHistoryAsync(req);

  return res.toObject();
};

WorkflowClient.prototype.queryWorkflow = async function({
  domain,
  executionFilter,
  query: { queryType },
}) {
  const wfQuery = new common.WorkflowQuery();
  const req = new messages.QueryWorkflowRequest();

  req.setDomain(domain);
  wfQuery.setQuerytype(queryType);
  req.setQueryworkflow(wfQuery);
  setWorkflowExecution(req, executionFilter);

  const res = await this.client.QueryWorkflowAsync(req);

  return res.toObject();
};

WorkflowClient.prototype.terminateWorkflow = async function({
  domain,
  executionFilter,
  reason,
}) {
  const req = new messages.TerminateWorkflowExecutionRequest();

  req.setDomain(domain);
  req.setReason(reason);
  setWorkflowExecution(req, executionFilter);

  const res = await this.client.TerminateWorkflowExecutionAsync(req);

  return res.toObject();
};

WorkflowClient.prototype.signalWorkflow = async function({
  domain,
  executionFilter,
  signal,
}) {
  const req = new messages.SignalWorkflowExecutionRequest();

  req.setDomain(domain);
  req.setSignalname(signal);
  setWorkflowExecution(req, executionFilter);

  const res = await this.client.SignalWorkflowExecutionAsync(req);

  return res.toObject();
};

WorkflowClient.prototype.describeWorkflow = async function({
  domain,
  executionFilter,
}) {
  const req = new messages.DescribeWorkflowExecutionRequest();

  req.setDomain(domain);
  setWorkflowExecution(req, executionFilter);

  const res = await this.client.DescribeWorkflowExecutionAsync(req);

  return res.toObject();
};

WorkflowClient.prototype.describeTaskList = async function({
  domain,
  taskList: { name },
  taskListType,
}) {
  const taskList = new common.TaskList();
  const req = new messages.DescribeTaskListRequest();

  req.setDomain(domain);
  taskList.setName(name);
  req.setTasklist(taskList);
  req.setTasklisttype(taskListType);

  const res = await this.client.DescribeTaskListAsync(req);

  return res.toObject();
};

function setWorkflowExecution(req, execution) {
  if (execution !== undefined && execution.workflowId !== undefined) {
    const wfExecution = new common.WorkflowExecution();

    wfExecution.setWorkflowid(execution.workflowId);

    if (execution.runId !== undefined) {
      wfExecution.setRunid(execution.runId);
    }

    req.setWorkflowexecution(wfExecution);
  }
}

function setWorkflowExecutionFilter(req, executionFilter) {
  if (
    executionFilter !== undefined &&
    executionFilter.workflowId !== undefined
  ) {
    const wfExecutionFilter = new common_execution.WorkflowExecutionFilter();

    wfExecutionFilter.setWorkflowid(executionFilter.workflowId);

    if (executionFilter.runId !== undefined) {
      wfExecutionFilter.setRunid(executionFilter.runId);
    }

    req.setExecutionfilter(wfExecutionFilter);
  }
}

function setTypeFilter(req, typeFilter) {
  if (typeFilter !== undefined && typeFilter.name !== undefined) {
    const wfTypeFilter = new common.WorkflowTypeFilter();

    wfTypeFilter.setName(typeFilter.name);
    req.setTypefilter(wfTypeFilter);
  }
}

function setStatusFilter(req, statusFilter) {
  if (statusFilter !== undefined) {
    const wfStatusFilter = new common.StatusFilter();

    statusFilter =
      enums.WorkflowExecutionCloseStatus[
        `WORKFLOWEXECUTIONCLOSESTATUS${statusFilter.toUpperCase()}`
      ];
    wfStatusFilter.setClosestatus(statusFilter);
    req.setStatusfilter(wfStatusFilter);
  }
}

module.exports = WorkflowClient;
