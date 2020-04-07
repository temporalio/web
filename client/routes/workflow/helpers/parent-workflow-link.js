export default function(wfStartDetails) {
  if (wfStartDetails && wfStartDetails.parentWorkflowExecution) {
    return {
      to: {
        name: 'workflow/summary',
        params: {
          namespace: wfStartDetails.parentWorkflowNamespace,
          workflowId: wfStartDetails.parentWorkflowExecution.workflowId,
          runId: wfStartDetails.parentWorkflowExecution.runId,
        },
      },
      text: wfStartDetails.parentWorkflowExecution.workflowId,
    };
  }

  return null;
}
