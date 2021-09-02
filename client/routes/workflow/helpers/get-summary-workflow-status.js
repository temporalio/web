const getSummaryWorkflowStatus = ({
  isWorkflowRunning,
  workflow,
  workflowCompletedEvent,
}) => {
  if (isWorkflowRunning) {
    return 'running';
  }

  if (!workflowCompletedEvent) {
    return (
      (workflow && workflow.workflowExecutionInfo.status) ||
      'running'
    ).toLowerCase();
  }

  const text = workflowCompletedEvent.eventType
    .replace('WorkflowExecution', '')
    .toLowerCase()
    .replace('continuedasnew', 'continued-as-new');

  // Any of {Completed,Failed,TimedOut,ContinuedAsNew} can have this field:
  if (workflowCompletedEvent.details && workflowCompletedEvent.details.newExecutionRunId) {
    return {
      text: text,
      status: text,
      next: {
        name: 'workflow/summary',
        params: {
          runId: workflowCompletedEvent.details.newExecutionRunId,
        },
      },
    };
  }

  return text;
};

export default getSummaryWorkflowStatus;
