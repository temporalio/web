<template>
  <section class="execution" :class="{ loading: wfLoading }">
    <navigation-bar>
      <navigation-link
        id="nav-link-summary"
        icon="icon_receipt"
        label="Summary"
        :to="{ name: 'workflow/summary' }"
        data-cy="summary-link"
      />
      <navigation-link
        id="nav-link-history"
        icon="icon_trip-history"
        label="History"
        :to="{ name: 'workflow/history' }"
        data-cy="history-link"
      />
      <navigation-link
        id="nav-link-stack-trace"
        icon="icon_trips"
        label="Stack Trace"
        :to="{ name: 'workflow/stack-trace' }"
        v-show="isWorkflowRunning"
        data-cy="stack-trace-link"
      />
      <navigation-link
        id="nav-link-query"
        icon="icon_lost"
        label="Query"
        :to="{ name: 'workflow/query' }"
        v-show="isWorkflowRunning"
        data-cy="query-link"
      />
    </navigation-bar>
    <router-view
      name="summary"
      :baseAPIURL="baseAPIURL"
      :input="summary.input"
      :isWorkflowRunning="summary.isWorkflowRunning"
      :parentWorkflowRoute="summary.parentWorkflowRoute"
      :result="summary.result"
      :wfStatus="summary.wfStatus"
      :workflow="summary.workflow"
      @onNotification="onNotification"
    />
    <router-view
      name="history"
      :baseAPIURL="baseAPIURL"
      :events="history.events"
      :loading="history.loading"
      :timelineEvents="history.timelineEvents"
      @onNotification="onNotification"
      @onEventsScroll="onEventsScroll"
    />
    <router-view
      name="stacktrace"
      :baseAPIURL="baseAPIURL"
      :taskQueueName="taskQueue.name"
      :isWorkerRunning="isWorkerRunning"
      @onNotification="onNotification"
    />
    <router-view
      name="query"
      :baseAPIURL="baseAPIURL"
      :taskQueueName="taskQueue.name"
      :isWorkerRunning="isWorkerRunning"
      @onNotification="onNotification"
    />
  </section>
</template>

<script>
import { RETRY_COUNT_MAX, RETRY_TIMEOUT } from './constants';
import {
  getHistoryEvents,
  getHistoryTimelineEvents,
  getSummary,
} from './helpers';
import { NOTIFICATION_TYPE_ERROR } from '~constants';
import { getErrorMessage } from '~helpers';
import { NavigationBar, NavigationLink } from '~components';

export default {
  data() {
    return {
      baseApiUrlRetryCount: 0,
      events: [],
      isWorkflowRunning: undefined,
      nextPageToken: undefined,
      fetchHistoryPageRetryCount: 0,
      wfLoading: true,
      workflow: undefined,

      history: {
        events: [],
        loading: undefined,
        timelineEvents: [],
      },

      summary: {
        input: undefined,
        isWorkflowRunning: undefined,
        parentWorkflowRoute: undefined,
        result: undefined,
        wfStatus: undefined,
        workflow: undefined,
      },

      taskQueue: {},

      unwatch: [],
    };
  },
  props: ['namespace', 'runId', 'workflowId'],
  created() {
    this.unwatch.push(
      this.$watch('baseAPIURL', this.onBaseApiUrlChange, { immediate: true })
    );
  },
  beforeDestroy() {
    this.clearWatches();
  },
  components: {
    'navigation-bar': NavigationBar,
    'navigation-link': NavigationLink,
  },
  computed: {
    baseAPIURL() {
      const { namespace, workflowId, runId } = this;

      return `/api/namespaces/${namespace}/workflows/${encodeURIComponent(
        workflowId
      )}/${encodeURIComponent(runId)}`;
    },
    historyUrl() {
      const historyUrl = `${this.baseAPIURL}/history?waitForNewEvent=true`;

      if (!this.nextPageToken) {
        return historyUrl;
      }

      return `${historyUrl}&nextPageToken=${encodeURIComponent(
        this.nextPageToken
      )}`;
    },
    isWorkerRunning() {
      return this.taskQueue.pollers && this.taskQueue.pollers.length > 0;
    },
  },
  methods: {
    clearState() {
      this.events = [];
      this.isWorkflowRunning = undefined;
      this.nextPageToken = undefined;
      this.fetchHistoryPageRetryCount = 0;
      this.wfLoading = true;
      this.workflow = undefined;

      this.history.events = [];
      this.history.loading = undefined;
      this.history.timelineEvents = [];

      this.summary.input = undefined;
      this.summary.isWorkflowRunning = undefined;
      this.summary.parentWorkflowRoute = undefined;
      this.summary.result = undefined;
      this.summary.wfStatus = undefined;
      this.summary.workflow = undefined;
    },
    clearWatches() {
      while (this.unwatch.length) {
        this.unwatch.pop()();
      }
    },
    async fetchHistoryPage(pagedHistoryUrl) {
      if (
        !pagedHistoryUrl ||
        this.fetchHistoryPageRetryCount >= RETRY_COUNT_MAX
      ) {
        this.history.loading = false;

        return Promise.resolve();
      }

      this.history.loading = true;
      return this.$http(pagedHistoryUrl)
        .then((res) => {
          setTimeout(() => {
            this.nextPageToken = res.nextPageToken;
          });

          const shouldHighlightEventId =
            this.$route.query.eventId &&
            this.events.length <= this.$route.query.eventId;

          const { events } = res.history;

          this.events = this.events.concat(events);

          this.history.events = getHistoryEvents(this.events);
          this.history.timelineEvents = getHistoryTimelineEvents(
            this.history.events
          );

          this.summary = getSummary({
            events: this.events,
            isWorkflowRunning: this.isWorkflowRunning,
            workflow: this.workflow,
          });

          if (shouldHighlightEventId) {
            this.$emit('highlight-event-id', this.$route.query.eventId);
          }

          this.fetchHistoryPageRetryCount = 0;

          return this.events;
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);

          this.$emit('onNotification', {
            message: getErrorMessage(error),
            type: NOTIFICATION_TYPE_ERROR,
          });

          this.fetchHistoryPageRetryCount += 1;
          setTimeout(
            () => this.fetchHistoryPage(pagedHistoryUrl),
            RETRY_TIMEOUT
          );
        })
        .finally(() => {
          this.history.loading = false;
        });
    },
    async onBaseApiUrlChange(baseAPIURL) {
      if (this.baseApiUrlRetryCount >= RETRY_COUNT_MAX) {
        return;
      }

      this.clearState();
      this.wfLoading = true;

      await this.$http(baseAPIURL)
        .then(
          (wf) => {
            this.workflow = wf;
            this.isWorkflowRunning = !wf.workflowExecutionInfo.closeTime;
            this.baseApiUrlRetryCount = 0;
          },
          (error) => {
            this.$emit('onNotification', {
              message: getErrorMessage(error),
              type: NOTIFICATION_TYPE_ERROR,
            });
            this.baseApiUrlRetryCount += 1;
            setTimeout(
              () => this.onBaseApiUrlChange(baseAPIURL),
              RETRY_TIMEOUT
            );
          }
        )
        .finally(() => {
          this.wfLoading = false;
        });

      await this.fetchHistoryPage(this.historyUrl)
      await this.fetchTaskQueue()
    },
    onNotification(event) {
      this.$emit('onNotification', event);
    },
    onEventsScroll(startIndex, endIndex) {
      if (this.history.loading || !this.nextPageToken) {
        return;
      }

      return this.fetchHistoryPage(this.historyUrl);
    },
    async fetchTaskQueue() {
      if (!this.workflow || !this.workflow.executionConfig) {
        return Promise.reject('task queue name is required');
      }

      const tqName = this.workflow.executionConfig.taskQueue.name;

      this.$http(
        `/api/namespaces/${this.$route.params.namespace}/task-queues/${tqName}`
      )
        .then(
          (tq) => {
            this.taskQueue = { name: tqName, ...tq };
          },
          (e) => {
            this.error = (e.json && e.json.message) || e.status || e.message;
          }
        )
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>
