import moment from 'moment';
import { failureKeys, jsonKeys, preKeys } from '~constants';
import { timestampToDate } from '~helpers';

function failureToString(failure) {
  let res = '';
  let node = { ...failure };
  let isRoot = true;

  while (node) {
    const { message, stackTrace, applicationFailureInfo } = node;
    const type = applicationFailureInfo?.type
      ? `${applicationFailureInfo.type}: `
      : '';
    const trace = stackTrace ? ` \n${stackTrace}` : ``;
    const err = `${type}${message}${trace}`;

    res += isRoot ? err : `\nCaused By: ${err}`;
    node = node.cause;
    isRoot = false;
  }

  return res;
}

const scheduledTimeView = time => {
  const scheduledTime = timestampToDate(time);
  const now = moment.now();
  let res = scheduledTime.format('lll');

  if (scheduledTime > now) {
    const delta = moment.duration(scheduledTime - now);

    res = `${res} (in ${delta.format()})`;
  }

  return res;
};

const getKeyValuePairs = event => {
  const kvps = [];
  const flatten = (prefix, obj, root) => {
    Object.entries(obj).forEach(([k, value]) => {
      if (value === null || value === undefined) {
        return;
      }

      const key = prefix ? `${prefix}.${k}` : k;

      if (value.routeLink) {
        kvps.push({
          key,
          routeLink: value.routeLink,
          value: value.text,
        });
      } else if (key === 'expirationTime') {
        const val = timestampToDate(value);

        if (!val || !val.isValid()) {
          return;
        }

        kvps.push({
          key,
          value: val.year() === 1969 ? '' : val.format('lll'), // 1969 corresponds to no expiration timeout
        });
      } else if (value.duration !== undefined) {
        kvps.push({
          key,
          value: moment.duration(value.duration, 'seconds').format(),
        });
      } else if (failureKeys.includes(k)) {
        kvps.push({ key, value: failureToString(value) });
      } else if (typeof value === 'object' && !jsonKeys.includes(key)) {
        flatten(key, value, root);
      } else if (key === 'newExecutionRunId') {
        kvps.push({
          key,
          routeLink: {
            name: 'workflow/summary',
            params: {
              runId: value,
            },
          },
          value,
        });
      } else if (key === 'parentWorkflowExecution.runId') {
        kvps.push({
          key,
          routeLink: {
            name: 'workflow/summary',
            params: {
              namespace: root.parentWorkflowNamespace,
              runId: value,
              workflowId: root.parentWorkflowExecution.workflowId,
            },
          },
          value,
        });
      } else if (key === 'workflowExecution.runId') {
        kvps.push({
          key,
          routeLink: {
            name: 'workflow/summary',
            params: {
              namespace: root.namespace,
              runId: value,
              workflowId: root.workflowExecution.workflowId,
            },
          },
          value,
        });
      } else if (key === 'scheduledTime') {
        kvps.push({ key, value: scheduledTimeView(value) });
      } else if (['lastStartedTime', 'lastHeartbeatTime'].includes(key)) {
        kvps.push({ key, value: timestampToDate(value).format('lll') });
      } else if (key === 'taskQueue.name' || key === 'Taskqueue') {
        kvps.push({
          key,
          routeLink: {
            name: 'task-queue',
            params: {
              taskQueue: value,
            },
          },
          value,
        });
      } else if (preKeys.includes(k)) {
        kvps.push({
          key,
          value: value?.payloads ?? value,
        });
      } else {
        kvps.push({
          key,
          value,
        });
      }
    });
  };

  flatten('', event || {}, event);

  return kvps;
};

export default getKeyValuePairs;
