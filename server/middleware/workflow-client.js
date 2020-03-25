const grpc = require('grpc');
const bluebird = require('bluebird');
const protoLoader = require('@grpc/proto-loader');
const Long = require('long');
const losslessJSON = require('lossless-json');
const moment = require('moment');

function buildHistory(getHistoryRes) {
  const history = getHistoryRes.history;

  history.events = getHistoryRes.history.events.map(e => {
    let attr = '';

    if (e.eventType) {
      attr = e.eventType.replace('EventType', '') + 'EventAttributes';
      attr = attr.charAt(0).toLowerCase() + attr.slice(1);
    }

    let details;

    if (e[attr]) {
      details = JSON.parse(JSON.stringify(e[attr]), function replacer(
        key,
        value
      ) {
        if (value && value.type && value.type === 'Buffer') {
          return Buffer.from(value)
            .toString()
            .replace(/["]/g, '')
            .trim();
        }

        return value;
      });
    }

    return {
      timestamp: e.timestamp,
      eventType: e.eventType,
      eventId: e.eventId,
      details,
    };
  });

  return history;
}

function buildWorkflowExecutionRequest(execution) {
  const req = { workflowId: execution.workflowId };

  if (execution.runId) {
    req.runId = Buffer.from(execution.runId);
  }

  return req;
}

function uiTransform(item) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  Object.entries(item).forEach(([subkey, subvalue]) => {
    if (subvalue && typeof subvalue.unsigned === 'boolean') {
      item[subkey] = Long.fromValue(subvalue).toNumber();
      const m = moment(item[subkey] / 1000000);

      if (m.isValid() && m.isAfter('2017-01-01')) {
        item[subkey] = m.toISOString();
      }
    } else if (Buffer.isBuffer(subvalue)) {
      if (subkey === 'nextPageToken') {
        item.nextPageToken = subvalue.toString('base64');

        return;
      }

      const stringval = subvalue.toString('utf8');

      try {
        // most of Cadence's uses of buffer is just line-delimited JSON.
        item[subkey] = stringval
          .split('\n')
          .filter(x => x)
          .map(JSON.parse);

        if (item[subkey].length === 1) {
          item[subkey] = item[subkey][0];
        }
      } catch (e) {
        item[`${subkey}_base64`] = subvalue.toString('base64');
        item[subkey] = stringval;
      }
    } else if (Array.isArray(subvalue)) {
      subvalue.forEach(uiTransform);
    } else if (subvalue && typeof subvalue === 'object') {
      uiTransform(subvalue);
    }
  });

  return item;
}

function cliTransform(item) {
  if (!item || typeof item !== 'object') {
    return item;
  }

  Object.entries(item).forEach(([subkey, subvalue]) => {
    if (subvalue && typeof subvalue.unsigned === 'boolean') {
      item[subkey] = new losslessJSON.LosslessNumber(
        Long.fromValue(subvalue).toString()
      );
    } else if (Buffer.isBuffer(subvalue)) {
      item[subkey] = subvalue.toString('base64');
    } else if (Array.isArray(subvalue)) {
      subvalue.forEach(cliTransform);
    } else if (subvalue && typeof subvalue === 'object') {
      cliTransform(subvalue);
    } else if (subvalue === null || subvalue === undefined) {
      delete item[subkey];
    }
  });

  return item;
}

function WorkflowClient() {
  const dir = process.cwd();
  const protoFileName = 'service.proto';
  const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [
      `${dir}/temporal-proto/`,
      `${dir}/temporal-proto/common`,
      `${dir}/temporal-proto/enums`,
      `${dir}/temporal-proto/failure`,
      `${dir}/temporal-proto/workflowservice`,
    ],
  };

  const packageDefinition = protoLoader.loadSync(protoFileName, options);
  const service = grpc.loadPackageDefinition(packageDefinition);

  let client = new service.workflowservice.WorkflowService(
    process.env.TEMPORAL_GRPC_ENDPOINT || '127.0.0.1:7233',
    grpc.credentials.createInsecure()
  );

  client = bluebird.promisifyAll(client);
  this.client = client;
}

WorkflowClient.prototype.describeDomain = async function({ name }) {
  const req = { name };

  const res = await this.client.describeDomainAsync(req);

  return uiTransform(res);
};

WorkflowClient.prototype.listDomains = async function({
  pageSize,
  nextPageToken,
}) {
  const req = { pageSize, nextPageToken };

  const res = await this.client.listDomainsAync(req);

  return uiTransform(res);
};

WorkflowClient.prototype.openWorkflows = async function({
  domain,
  startTimeFilter,
  typeFilter,
  executionFilter,
  nextPageToken,
  maximumPageSize = 100,
}) {
  const req = {
    domain,
    StartTimeFilter: startTimeFilter,
    typeFilter,
    executionFilter,
    nextPageToken,
    maximumPageSize,
  };
  const res = await this.client.listOpenWorkflowExecutionsAsync(req);

  return uiTransform(res);
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
  const req = {
    domain,
    StartTimeFilter: startTimeFilter,
    typeFilter,
    executionFilter,
    statusFilter,
    nextPageToken,
    maximumPageSize,
  };

  const res = await this.client.listClosedWorkflowExecutionsAsync(req);

  return uiTransform(res);
};

WorkflowClient.prototype.listWorkflows = async function({
  domain,
  query,
  nextPageToken,
  pageSize = 20,
  maximumPageSize = 100,
}) {
  const req = {
    domain,
    query,
    nextPageToken,
    pageSize,
    maximumPageSize,
  };

  const res = await this.client.listWorkflowExecutionsAsync(req);

  return uiTransform(res);
};

WorkflowClient.prototype.getHistory = async function({
  domain,
  nextPageToken,
  execution,
  waitForNewEvent,
  maximumPageSize = 100,
}) {
  const req = {
    domain,
    nextPageToken,
    execution: buildWorkflowExecutionRequest(execution),
    waitForNewEvent,
    maximumPageSize,
  };

  const res = await this.client.getWorkflowExecutionHistoryAsync(req);

  if (res.history && res.history.events) {
    res.history = buildHistory(res);
  }

  return uiTransform(res);
};

WorkflowClient.prototype.exportHistory = async function({
  domain,
  execution,
  nextPageToken,
}) {
  const req = {
    domain,
    execution: buildWorkflowExecutionRequest(execution),
    nextPageToken,
  };

  const res = await this.client.getWorkflowExecutionHistoryAsync(req);

  return cliTransform(res);
};

WorkflowClient.prototype.queryWorkflow = async function({
  domain,
  execution,
  query,
}) {
  const req = {
    domain,
    execution: buildWorkflowExecutionRequest(execution),
    query,
  };
  const res = await this.client.queryWorkflowAsync(req);

  return uiTransform(res);
};

WorkflowClient.prototype.terminateWorkflow = async function({
  domain,
  execution,
  reason,
}) {
  const req = {
    domain,
    workflowExecution: buildWorkflowExecutionRequest(execution),
    reason,
  };

  const res = await this.client.terminateWorkflowExecutionAsync(req);

  return uiTransform(res);
};

WorkflowClient.prototype.signalWorkflow = async function({
  domain,
  execution,
  signal,
}) {
  const req = {
    domain,
    workflowExecution: buildWorkflowExecutionRequest(execution),
    signal,
  };

  const res = await this.client.signalWorkflowExecutionAsync(req);

  return uiTransform(res);
};

WorkflowClient.prototype.describeWorkflow = async function({
  domain,
  execution,
}) {
  const req = {
    domain,
    execution: buildWorkflowExecutionRequest(execution),
  };

  const res = await this.client.describeWorkflowExecutionAsync(req);

  return uiTransform(res);
};

WorkflowClient.prototype.describeTaskList = async function({
  domain,
  taskList,
  taskListType,
}) {
  const req = { domain, taskList, taskListType };
  const res = await this.client.describeTaskListAsync(req);

  return uiTransform(res);
};

module.exports = WorkflowClient;
