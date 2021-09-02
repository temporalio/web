import getSummaryWorkflowStatus from './get-summary-workflow-status';

describe('getSummaryWorkflowStatus', () => {
  describe('When passed an event with isWorkflowRunning = true', () => {
    it('should return "running".', () => {
      const event = {
        isWorkflowRunning: true,
      };
      const output = getSummaryWorkflowStatus(event);

      expect(output).toEqual('running');
    });
  });

  describe('When passed an event with workflowCompletedEvent = false and workflow.workflowExecutionInfo.status is defined', () => {
    it('should return workflow.workflowExecutionInfo.status in lower case.', () => {
      const event = {
        workflow: {
          workflowExecutionInfo: {
            status: 'statusValue',
          },
        },
        workflowCompletedEvent: false,
      };
      const output = getSummaryWorkflowStatus(event);

      expect(output).toEqual('statusvalue');
    });
  });

  describe('When passed an event with workflowCompletedEvent = false and workflow.workflowExecutionInfo.status is not defined', () => {
    it('should return "running".', () => {
      const event = {
        workflowCompletedEvent: false,
      };
      const output = getSummaryWorkflowStatus(event);

      expect(output).toEqual('running');
    });
  });

  describe('When passed an event with workflowCompletedEvent.eventType === "WorkflowExecutionContinuedAsNew" and workflowCompletedEvent.details.newExecutionRunId is defined', () => {
    let event;

    beforeEach(() => {
      event = {
        workflowCompletedEvent: {
          eventType: 'WorkflowExecutionContinuedAsNew',
          details: {
            newExecutionRunId: 'newExecutionRunIdValue',
          },
        },
      };
    });

    it('should return an object with next.name = "workflow/summary".', () => {
      const output = getSummaryWorkflowStatus(event);

      expect(output.next.name).toEqual('workflow/summary');
    });

    it('should return an object with next.params.runId.', () => {
      const output = getSummaryWorkflowStatus(event);

      expect(output.next.params.runId).toEqual('newExecutionRunIdValue');
    });

    it('should return an object with text = "continued-as-new".', () => {
      const output = getSummaryWorkflowStatus(event);

      expect(output.text).toEqual('continued-as-new');
    });

    it('should return an object with status = "continued-as-new".', () => {
      const output = getSummaryWorkflowStatus(event);

      expect(output.status).toEqual('continued-as-new');
    });
  });

  describe('When passed an event with workflowCompletedEvent.eventType === "WorkflowExecutionCompleted" and workflowCompletedEvent.details.newExecutionRunId is defined', () => {
    let event;

    beforeEach(() => {
      event = {
        workflowCompletedEvent: {
          eventType: 'WorkflowExecutionCompleted',
          details: {
            newExecutionRunId: 'newExecutionRunIdValue',
          },
        },
      };
    });

    it('should return an object with next.name = "workflow/summary".', () => {
      const output = getSummaryWorkflowStatus(event);

      expect(output.next.name).toEqual('workflow/summary');
    });

    it('should return an object with next.params.runId.', () => {
      const output = getSummaryWorkflowStatus(event);

      expect(output.next.params.runId).toEqual('newExecutionRunIdValue');
    });

    it('should return an object with text = "completed".', () => {
      const output = getSummaryWorkflowStatus(event);

      expect(output.text).toEqual('completed');
    });

    it('should return an object with status = "completed".', () => {
      const output = getSummaryWorkflowStatus(event);

      expect(output.status).toEqual('completed');
    });
  });

  describe('When passed an workflowCompletedEvent.eventType !== "WorkflowExecutionContinuedAsNew"', () => {
    it('should return workflowCompletedEvent.eventType without WorkflowExecution and in lower case.', () => {
      const event = {
        workflowCompletedEvent: {
          eventType: 'WorkflowExecutionSomethingElse',
        },
      };
      const output = getSummaryWorkflowStatus(event);

      expect(output).toEqual('somethingelse');
    });
  });
});
