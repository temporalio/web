<template>
  <section :class="{ 'stack-trace': true, loading }" data-cy="stack-trace">
    <header v-if="stackTraceTimestamp">
      <span>Stack trace at {{ stackTraceTimestamp.format('h:mm:ss a') }}</span>
      <a href="#" class="refresh" @click="getStackTrace">Refresh</a>
    </header>

    <pre v-if="stackTrace && stackTrace.payloads" class="stack-trace-view">{{
      stackTrace.payloads
    }}</pre>

    <span class="error" v-if="stackTrace && stackTrace.error">
      {{ stackTrace.error }}
    </span>
    <span v-if="!isWorkerRunning" class="no-queries">
      There is no Worker currently listening to the Task Queue
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
  </section>
</template>

<script>
import moment from 'moment';
import { getQueryResult } from './helpers/get-query-result';

export default {
  data() {
    return {
      loading: undefined,
      stackTrace: undefined,
      stackTraceTimestamp: undefined,
    };
  },
  props: ['baseAPIURL', 'taskQueueName', 'isWorkerRunning'],
  created() {
    if (!this.isWorkerRunning) {
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
          this.stackTrace = getQueryResult(queryResult);
          this.stackTraceTimestamp = moment();
        })
        .catch((e) => {
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
      if (newVal == false) {
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
  white-space pre-wrap

span.no-queries {
  display: block;
  width: 100%;
  text-align: center;
  font-size: 20px;
  color: uber-black-60;
}
</style>
