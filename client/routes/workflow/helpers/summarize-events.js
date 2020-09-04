import moment from 'moment';
import parentWorkflowLink from './parent-workflow-link';
import workflowLink from './workflow-link';
import { shortName } from '~helpers';

const summaryExtractors = {
  ActivityTaskCancelRequested: (d) => ({ Id: d.activityId }),
  ActivityTaskCompleted: (d) => ({ result: d.result }),
  ActivityTaskFailed: (d) => ({
    details: d.details,
    reason: d.reason,
  }),
  ActivityTaskScheduled: (d) => ({
    'Close Timeout': moment
      .duration(d.scheduleToCloseTimeout?.duration, 'seconds')
      .format(),
    Id: d.activityId,
    input: d.input,
    Name: shortName(d.activityType.name),
  }),
  ActivityTaskStarted: (d) => ({
    attempt: d.attempt,
    identity: d.identity,
    requestId: d.requestId,
  }),
  ActivityTaskTimedOut: (d) => ({ 'Timeout Type': d.timeoutType }),
  ChildWorkflowExecutionCompleted: (d) => ({
    result: d.result,
    Workflow: workflowLink(d, true),
  }),
  ChildWorkflowExecutionStarted: (d) => ({
    Workflow: workflowLink(d),
  }),
  WorkflowTaskCompleted: (d) => ({ identity: d.identity }),
  WorkflowTaskScheduled: (d) => ({
    Taskqueue: d.taskQueue.name,
    Timeout: moment
      .duration(d.startToCloseTimeout?.duration, 'seconds')
      .format(),
  }),
  WorkflowTaskStarted: (d) => ({ requestId: d.requestId }),
  WorkflowTaskTimedOut: (d) => ({ 'Timeout Type': d.timeoutType }),
  ExternalWorkflowExecutionSignaled: (d) => ({
    Workflow: workflowLink(d),
  }),
  MarkerRecorded: (d) => {
    const details = d.details || {};

    if (d.markerName === 'LocalActivity') {
      const la = { 'Local Activity ID': details.ActivityId };

      if (details.ErrJSON) {
        la.Error = JSON.tryParse(details.ErrJSON) || details.ErrJSON;
      }

      if (details.ErrReason) {
        la.reason = details.ErrReason;
      }

      if (details.ResultJSON) {
        la.result = JSON.tryParse(details.ResultJSON) || details.ResultJSON;
      }

      return la;
    }

    if (d.markerName === 'Version') {
      return {
        Details: details[0],
        Version: details[1],
      };
    }

    if (d.markerName === 'SideEffect') {
      return details.data;
    }

    return d;
  },
  StartChildWorkflowExecutionInitiated: (d) => ({
    input: d.input,
    Taskqueue: d.taskQueue.name,
    Workflow: shortName(d.workflowType.name),
  }),
  SignalExternalWorkflowExecutionInitiated: (d) => ({
    input: d.input,
    signal: d.signalName,
    Workflow: workflowLink(d),
  }),
  TimerStarted: (d) => ({
    'Fire Timeout': moment
      .duration(d.startToFireTimeout?.duration, 'seconds')
      .format(),
    'Timer ID': d.timerId,
  }),
  WorkflowExecutionStarted: (d) => {
    const summary = {
      'Close Timeout': moment
        .duration(d.workflowExecutionTimeout?.duration, 'seconds')
        .format(),
      identity: d.identity,
      input: d.input,
      Parent: undefined,
      Workflow: d.workflowType ? shortName(d.workflowType.name) : '',
    };
    const wfLink = parentWorkflowLink(d);

    if (wfLink) {
      summary.Parent = {
        routeLink: wfLink.to,
        text: wfLink.text,
      };
    }

    return summary;
  },
  WorkflowExecutionFailed: (d) => {
    return { message: d.failure.message };
  },
  WorkflowTaskFailed: (d) => {
    return { message: d.failure.message };
  },
  ChildWorkflowExecutionFailed: (d) => {
    return { message: d.failure.message };
  },
};

const isKnownEventType = (eventType) => {
  return eventType in summaryExtractors;
};

const extractEventSummary = (eventType, eventDetails) => {
  return isKnownEventType(eventType)
    ? summaryExtractors[eventType](eventDetails)
    : eventDetails;
};

export { isKnownEventType, extractEventSummary };
