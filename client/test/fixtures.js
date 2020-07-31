import moment from 'moment';

const timeBasis = moment()
  .startOf('day')
  .add(5, 'hours');
const emailRun1Start = moment(timeBasis)
  .subtract(3, 'minutes')
  .subtract(1, 'day');
const exampleTimeoutStart = moment(timeBasis).subtract(2, 'hours');
const timelineVarietyStart = moment(timeBasis).subtract(5, 'hours');

export default {
  timeBasis,
  workflows: {
    open: [
      {
        execution: {
          workflowId:
            'github.com/temporalio/temporal-web/email-daily-summaries-2',
          runId: 'ef2c889e-e709-4d50-99ee-3748dfa0a101',
        },
        type: {
          name: 'email-daily-summaries',
        },
        startTime: moment(timeBasis)
          .subtract(3, 'minutes')
          .toISOString(),
      },
      {
        execution: {
          workflowId: 'github.com/temporalio/temporal-web/example-1',
          runId: 'db8da3c0-b7d3-48b7-a9b3-b6f566e58207',
        },
        type: {
          name: 'example',
        },
        startTime: moment(timeBasis)
          .subtract(20, 'seconds')
          .toISOString(),
      },
    ],
    closed: [
      {
        execution: {
          workflowId: 'email-daily-summaries',
          runId: '51ccc0d1-6ffe-4a7a-a89f-6b5154df86f7',
        },
        type: {
          name: 'github.com/temporalio/temporal-web/email-daily-summaries-1',
        },
        status: 'COMPLETED',
        startTime: emailRun1Start.toISOString(),
        closeTime: moment(timeBasis)
          .subtract(2, 'minutes')
          .subtract(1, 'day')
          .toISOString(),
      },
    ],
  },
  history: {
    emailRun1: [
      {
        eventTime: emailRun1Start.toISOString(),
        eventType: 'WorkflowExecutionStarted',
        eventId: 1,
        details: {
          workflowType: {
            name: 'email-daily-summaries',
          },
          taskQueue: {
            name: 'ci-task-queue',
          },
          input: [839134, { env: 'prod' }],
          executionStartToCloseTimeoutSeconds: 360,
          taskStartToCloseTimeoutSeconds: 180,
        },
      },
      {
        eventTime: emailRun1Start.toISOString(),
        eventType: 'WorkflowTaskScheduled',
        eventId: 2,
        details: {
          taskQueue: {
            name: 'ci-task-queue',
          },
          zero: 0,
        },
      },
      {
        eventTime: emailRun1Start.toISOString(),
        eventType: 'WorkflowTaskStarted',
        eventId: 3,
        details: {
          scheduledEventId: 2,
          question: 'What is the answer to life, the universe, and everything?',
          requestId: 'abefc8d3-c654-49e6-8e17-126847bf315f',
        },
      },
      {
        eventTime: emailRun1Start.add(1, 'second').toISOString(),
        eventType: 'WorkflowTaskCompleted',
        eventId: 4,
        details: {
          scheduledEventId: 2,
          startedEventId: 3,
          answer: 42,
        },
      },
      {
        eventTime: emailRun1Start.add(1, 'second').toISOString(),
        eventType: 'MarkerRecorded',
        eventId: 5,
        details: {
          markerName: 'Version',
          details: [0, 'initial version'],
          workflowTaskCompletedEventId: 4,
        },
      },
      {
        eventTime: emailRun1Start.add(1, 'second').toISOString(),
        eventType: 'ActivityTaskScheduled',
        eventId: 6,
        details: {
          activityId: '0',
          activityType: {
            name: 'send-emails',
          },
          taskQueue: {
            name: 'ci-task-queue',
          },
          input: [12345, ['bob@example.com', 'jane@somewhere.com']],
          scheduleToCloseTimeoutSeconds: 360,
          scheduleToStartTimeoutSeconds: 180,
          startToCloseTimeoutSeconds: 180,
          heartbeatTimeoutSeconds: 0,
          workflowTaskCompletedEventId: 4,
        },
      },
      {
        eventTime: emailRun1Start.add(5, 'second').toISOString(),
        eventType: 'ActivityTaskStarted',
        eventId: 7,
        details: {
          scheduledEventId: 6,
          requestId: '13624219-683c-401e-a321-db04cdac724a',
        },
      },
      {
        eventTime: emailRun1Start.add(11, 'second').toISOString(),
        eventType: 'ActivityTaskCompleted',
        eventId: 8,
        details: {
          result:
            '{IntVal:9223372036854775807,IntPtrVal:9223372036854775807,FloatVal:1.7976931348623157e+308,StringVal:canary_echo_test,StringPtrVal:canary_echo_test,SliceVal:[canary,.,echoWorkflow],MapVal:{us-east-1:dca1a,us-west-1:sjc1a}}',
          scheduledEventId: 6,
          startedEventId: 7,
        },
      },
      {
        eventTime: emailRun1Start.add(11, 'second').toISOString(),
        eventType: 'WorkflowTaskScheduled',
        eventId: 9,
        details: { taskQueue: { name: 'ci-task-queue' } },
      },
      {
        eventTime: emailRun1Start.add(11, 'second').toISOString(),
        eventType: 'WorkflowTaskStarted',
        eventId: 10,
        details: {
          scheduledEventId: 9,
          foo: 'bar',
        },
      },
      {
        eventTime: emailRun1Start.add(11, 'second').toISOString(),
        eventType: 'WorkflowTaskCompleted',
        eventId: 11,
        details: {
          scheduledEventId: 9,
          startedEventId: 10,
        },
      },
      {
        eventTime: emailRun1Start.add(12, 'second').toISOString(),
        eventType: 'WorkflowExecutionCompleted',
        eventId: 12,
        details: {
          result: {
            recipients: ['bob@example.com', 'jane@example.com'],
            trackingTag: 'foobarbaz',
          },
          workflowTaskCompletedEventId: 11,
        },
      },
    ],
    exampleTimeout: [
      {
        details: {
          executionStartToCloseTimeoutSeconds: 360,
          taskQueue: {
            name: 'canary-task-queue',
          },
          taskStartToCloseTimeoutSeconds: 180,
          workflowType: {
            name: 'example',
          },
        },
        eventId: 1,
        eventType: 'WorkflowExecutionStarted',
        eventTime: exampleTimeoutStart.toISOString(),
      },
      {
        eventId: 2,
        eventType: 'WorkflowTaskScheduled',
        eventTime: exampleTimeoutStart.toISOString(),
      },
      {
        details: {
          scheduledEventId: 2,
        },
        eventId: 3,
        eventType: 'WorkflowTaskStarted',
        eventTime: exampleTimeoutStart.toISOString(),
      },
      {
        details: {
          scheduledEventId: 2,
          startedEventId: 3,
        },
        eventId: 4,
        eventType: 'WorkflowTaskCompleted',
        eventTime: exampleTimeoutStart.toISOString(),
      },
      {
        details: {
          workflowTaskCompletedEventId: 4,
        },
        eventId: 5,
        eventType: 'MarkerRecorded',
        eventTime: exampleTimeoutStart.toISOString(),
      },
      {
        details: {
          activityId: 0,
          activityType: {
            name: 'activity.timeout',
          },
          workflowTaskCompletedEventId: 4,
          heartbeatTimeoutSeconds: 0,
          scheduleToCloseTimeoutSeconds: 2,
          scheduleToStartTimeoutSeconds: 1,
          startToCloseTimeoutSeconds: 1,
          taskQueue: {
            name: 'ci-task-queue',
          },
        },
        eventId: 6,
        eventType: 'ActivityTaskScheduled',
        eventTime: exampleTimeoutStart.add(1, 'second').toISOString(),
      },
      {
        details: {
          requestId: '71e3bef1-d6db-4ce1-b705-cf81732a6faf',
          scheduledEventId: 6,
        },
        eventId: 7,
        eventType: 'ActivityTaskStarted',
        eventTime: exampleTimeoutStart.add(1, 'second').toISOString(),
      },
      {
        details: {
          scheduledEventId: 6,
          startedEventId: 7,
          timeoutType: 'START_TO_CLOSE',
        },
        eventId: 8,
        eventType: 'ActivityTaskTimedOut',
        eventTime: exampleTimeoutStart.add(2, 'second').toISOString(),
      },
      {
        details: {
          startToCloseTimeoutSeconds: 180,
          taskQueue: {
            name: 'compute3330-sjc1:43b62b8e-aa2a-4b58-9571-39062a073d24',
          },
        },
        eventId: 9,
        eventType: 'WorkflowTaskScheduled',
        eventTime: exampleTimeoutStart.add(2, 'second').toISOString(),
      },
      {
        details: {
          scheduledEventId: 9,
        },
        eventId: 10,
        eventType: 'WorkflowTaskStarted',
        eventTime: exampleTimeoutStart.add(2, 'second').toISOString(),
      },
      {
        details: {
          executionContext: null,
          scheduledEventId: 9,
          startedEventId: 10,
        },
        eventId: 11,
        eventType: 'WorkflowTaskCompleted',
        eventTime: exampleTimeoutStart.add(2, 'second').toISOString(),
      },
      {
        details: {
          reason: 'activityTimeout',
          activityId: 0,
        },
        eventId: 12,
        eventType: 'WorkflowExecutionCompleted',
        eventTime: exampleTimeoutStart.add(2, 'second').toISOString(),
      },
    ],
    timelineVariety: [
      {
        eventTime: timelineVarietyStart.toISOString(),
        eventType: 'WorkflowExecutionStarted',
        eventId: 1,
        details: {
          workflowType: {
            name: 'email-daily-summaries',
          },
          taskQueue: {
            name: 'ci-task-queue',
          },
          input: [839134, { env: 'prod' }],
          executionStartToCloseTimeoutSeconds: 360,
          taskStartToCloseTimeoutSeconds: 180,
        },
      },
      {
        eventTime: timelineVarietyStart.toISOString(),
        eventType: 'WorkflowTaskScheduled',
        eventId: 2,
        details: {
          taskQueue: {
            name: 'ci-task-queue',
          },
          zero: 0,
        },
      },
      {
        eventTime: timelineVarietyStart.toISOString(),
        eventType: 'WorkflowTaskStarted',
        eventId: 3,
        details: {
          scheduledEventId: 2,
          question: 'What is the answer to life, the universe, and everything?',
          requestId: 'abefc8d3-c654-49e6-8e17-126847bf315f',
        },
      },
      {
        eventTime: timelineVarietyStart.add(1, 'second').toISOString(),
        eventType: 'WorkflowTaskCompleted',
        eventId: 4,
        details: {
          scheduledEventId: 2,
          startedEventId: 3,
          answer: 42,
        },
      },
      {
        eventTime: timelineVarietyStart.add(1, 'second').toISOString(),
        eventType: 'MarkerRecorded',
        eventId: 5,
        details: {
          markerName: 'Version',
          details: [0, 'initial version'],
          workflowTaskCompletedEventId: 4,
        },
      },
      {
        eventTime: timelineVarietyStart.add(1, 'second').toISOString(),
        eventType: 'ActivityTaskScheduled',
        eventId: 6,
        details: {
          activityId: 0,
          activityType: {
            name: 'search-for-treasure',
          },
          taskQueue: {
            name: 'ci-task-queue',
          },
          input: { location: 'volcanic island' },
          scheduleToCloseTimeoutSeconds: 360,
          scheduleToStartTimeoutSeconds: 180,
          startToCloseTimeoutSeconds: 180,
          heartbeatTimeoutSeconds: 0,
          workflowTaskCompletedEventId: 4,
        },
      },
      {
        eventTime: timelineVarietyStart.add(5, 'second').toISOString(),
        eventType: 'ActivityTaskStarted',
        eventId: 7,
        details: {
          scheduledEventId: 6,
          requestId: '13624219-683c-401e-a321-db04cdac724a',
        },
      },
      {
        eventTime: timelineVarietyStart.add(1, 'second').toISOString(),
        eventType: 'MarkerRecorded',
        eventId: 8,
        details: {
          markerName: 'SideEffect',
          details: [0, btoa(JSON.stringify({ foo: 'bar' }))],
        },
      },
      {
        eventTime: timelineVarietyStart.add(11, 'second').toISOString(),
        eventType: 'ActivityTaskCompleted',
        eventId: 9,
        details: {
          result: 'no treasure',
          scheduledEventId: 6,
          startedEventId: 7,
        },
      },
      {
        eventTime: timelineVarietyStart.add(11, 'second').toISOString(),
        eventType: 'StartChildWorkflowExecutionInitiated',
        eventId: 10,
        details: {
          workflowType: { name: 'sail-the-ocean' },
          taskQueue: { name: 'another-queue' },
          input: { direction: 'west' },
        },
      },
      {
        eventTime: timelineVarietyStart.add(11, 'second').toISOString(),
        eventType: 'ChildWorkflowExecutionStarted',
        eventId: 11,
        details: {
          namespace: 'pirates',
          workflowType: { name: 'sail-the-ocean' },
          workflowExecution: {
            workflowId: 'sail-the-ocean-1',
            runId: 'arrr56',
          },
          initiatedEventId: 10,
        },
      },
      {
        eventTime: timelineVarietyStart.add(11, 'second').toISOString(),
        eventType: 'ActivityTaskScheduled',
        eventId: 12,
        details: {
          activityId: 1,
          activityType: {
            name: 'swab-the-deck',
          },
          taskQueue: {
            name: 'ci-task-queue',
          },
          input: { moveTheGrogToo: true },
          scheduleToCloseTimeoutSeconds: 3600,
          scheduleToStartTimeoutSeconds: 180,
          startToCloseTimeoutSeconds: 3780,
          heartbeatTimeoutSeconds: 0,
        },
      },
      {
        eventTime: timelineVarietyStart.add(12, 'second').toISOString(),
        eventType: 'ActivityTaskStarted',
        eventId: 13,
        details: {
          scheduledEventId: 12,
          attempt: 1,
          requestId: 'e44b387b-7315-4238-93c5-dc0e1e67f317',
        },
      },
      {
        eventTime: timelineVarietyStart.add(13, 'second').toISOString(),
        eventType: 'MarkerRecorded',
        eventId: 14,
        details: {
          markerName: 'LocalActivity',
          details: {
            ActivityId: 1,
            ErrReason: 'child process failed',
            ErrJSON: JSON.stringify({ exitcode: 1 }),
          },
        },
      },
      {
        eventTime: timelineVarietyStart.add(15, 'second').toISOString(),
        eventType: 'MarkerRecorded',
        eventId: 15,
        details: {
          markerName: 'LocalActivity',
          details: {
            ActivityId: 2,
            ResultJSON: JSON.stringify({ parrot_name: 'squaky' }),
          },
        },
      },
      {
        eventTime: timelineVarietyStart
          .add(1, 'minute')
          .add(2, 'second')
          .toISOString(),
        eventType: 'ActivityTaskFailed',
        eventId: 16,
        details: {
          reason: "couldn't find the mop",
          details: { pirate_name: 'McShorty' },
          scheduledEventId: 12,
          startedEventId: 13,
        },
      },
      {
        eventTime: timelineVarietyStart
          .add(1, 'minute')
          .add(20, 'second')
          .toISOString(),
        eventType: 'WorkflowExecutionSignaled',
        eventId: 17,
        details: {
          input: {
            message: 'enemy ship spotted!',
            position: "7 o'clock",
          },
        },
      },
      {
        eventTime: timelineVarietyStart
          .add(2, 'minute')
          .add(10, 'seconds')
          .toISOString(),
        eventType: 'ChildWorkflowExecutionCompleted',
        eventId: 18,
        details: {
          workflowType: { name: 'sail-the-ocean' },
          workflowExecution: {
            workflowId: 'sail-the-ocean-1',
            runId: 'arrr56',
          },
          result: {
            treasure: false,
            notes: 'enemies abound!',
          },
          initiatedEventId: 10,
        },
      },
      {
        eventTime: timelineVarietyStart
          .add(2, 'minute')
          .add(10, 'seconds')
          .toISOString(),
        eventType: 'WorkflowExecutionCompleted',
        eventId: 19,
        details: {
          result: {
            recipients: ['bob@example.com', 'jane@example.com'],
            trackingTag: 'foobarbaz',
          },
          workflowTaskCompletedEventId: 11,
        },
      },
    ],
  },
};
