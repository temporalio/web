<template>
  <section :class="{ 'stack-trace': true, loading }" data-cy="stack-trace">
    <span v-if="!isWorkflowRunning" class="no-queries">
      Workflow execution has finished. No stack trace available
    </span>
    <span v-else-if="stackTrace && stackTrace.error" class="error">
      {{ stackTrace.error }}
    </span>
    <span v-else-if="!isWorkerRunning" class="no-queries">
      There are no Workers currently listening to the Task Queue:
      <router-link
        :to="{
          name: 'task-queue',
          params: {
            taskQueue: taskQueueName,
          },
        }"
        >{{ taskQueueName }}
      </router-link>
    </span>

    <div v-else>
      <header v-if="stackTraceTimestamp">
        <span
          >Stack trace at {{ stackTraceTimestamp.format('h:mm:ss a') }}</span
        >
        <a href="#" class="refresh" @click="getStackTrace">Refresh</a>
      </header>
      <prism
        v-for="(payload, index) in stackTrace.payloads"
        :key="index"
        language="json"
        class="stack-trace-view"
      >
        {{ payload }}
      </prism>
    </div>
  </section>
</template>

<script>
import moment from 'moment';

import 'prismjs';
import 'prismjs/components/prism-json';
import Prism from 'vue-prism-component';

export default {
  components: {
    prism: Prism,
  },
  data() {
    return {
      loading: undefined,
      stackTrace: { payloads: [] },
      stackTraceTimestamp: undefined,
    };
  },
  props: [
    'baseAPIURL',
    'taskQueueName',
    'isWorkerRunning',
    'isWorkflowRunning',
  ],
  created() {
    if (!this.isWorkerRunning || !this.isWorkflowRunning) {
      return;
    }

    this.getStackTrace();
  },
  methods: {
    getStackTrace() {
      this.loading = true;

      return this.$http
        .post(`${this.baseAPIURL}/query/__stack_trace`)
        .then(({ queryResult }) => {
          queryResult.payloads = queryResult.payloads.map(p =>
            p?.replaceAll('\n', ' \n ')
          );
          this.stackTrace = queryResult;
          this.stackTraceTimestamp = moment();
        })
        .catch(e => {
          // eslint-disable-next-line no-console
          console.error(e);
          this.stackTrace = {
            error: (e.json && e.json.message) || e.status || e.message,
          };
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
  watch: {
    isWorkerRunning: function(newVal, oldVal) {
      if (newVal == false || !this.isWorkflowRunning) {
        this.queries = [];

        return;
      }

      this.getStackTrace();
    },
  },
};
</script>

<style lang="stylus">
@require "../../styles/definitions.styl"

section.stack-trace
  padding layout-spacing-small
  header
    margin-bottom layout-spacing-medium
  a.refresh
    margin 0 1em
    action-button()
    icon-refresh()

section .stack-trace-view
  white-space pre-line

span.no-queries {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 20px;
  color: uber-black-60;
}
</style>
