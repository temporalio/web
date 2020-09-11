<template>
  <section class="query" :class="{ loading }" data-cy="query">
    <header v-if="queries && queries.length">
      <div class="query-name">
        <v-select
          placeholder="Choose a Query"
          :value="queryName"
          :options="queries"
          :on-change="setQuery"
          :searchable="false"
        />
      </div>
      <a
        :href="queryName && !running ? '#' : undefined"
        :class="{ run: true, running }"
        @click.prevent="run"
      >
        Run
      </a>
    </header>
    <pre v-if="queryResult && queryResult.payloads">{{
      queryResult.payloads
    }}</pre>
    <span class="error" v-if="error">{{ error }}</span>
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
    <span class="no-queries" v-else-if="queries && queries.length === 0">
      No queries registered
    </span>
  </section>
</template>

<script>
import { getQueryResult } from './helpers/get-query-result';

export default {
  data() {
    return {
      error: undefined,
      loading: false,
      queryName: undefined,
      queryInput: undefined,
      queries: [],
      queryResult: undefined,
      running: false,
    };
  },
  props: ['baseAPIURL', 'taskQueueName', 'isWorkerRunning'],
  created() {
    if (!this.isWorkerRunning) {
      return;
    }
    this.fetchQueries();
  },
  methods: {
    setQuery(queryName) {
      this.queryResult = undefined;
      this.error = undefined;
      this.queryName = queryName;
    },
    run() {
      this.running = true;
      this.$http
        .post(`${this.baseAPIURL}/query/${this.queryName}`)
        .then(
          ({ queryResult }) => {
            this.queryResult = getQueryResult(queryResult);
          },
          (e) => {
            this.error = (e.json && e.json.message) || e.status || e.message;
          }
        )
        .finally(() => {
          this.running = false;
        });
    },
    fetchQueries() {
      this.loading = true;
      return this.$http(`${this.baseAPIURL}/query`)
        .then(
          (queries) => {
            this.queries = queries.filter((query) => query !== '__stack_trace');

            if (!this.queryName) {
              [this.queryName] = this.queries;
            }
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
  watch: {
    isWorkerRunning: function(newVal, oldVal) {
      if (newVal == false) {
        this.queries = [];
        return;
      }
      this.fetchQueries();
    },
  },
};
</script>

<style lang="stylus">
@require "../../styles/definitions.styl"

section.query {
  padding: layout-spacing-small;

  header {
    display: flex;
    padding-top: layout-spacing-small;
    margin-bottom: layout-spacing-medium;
    align-items: center;

    .query-name {
      flex: 0 0 auto;
      min-width: 350px;
      superlabel();

      &::before {
        top: -16px;
        content: 'query';
      }
    }

    a.run {
      flex: 0 0 auto;
      margin: 0 1em;
      action-button();
      icon-play();

      &:not([href="#"]) {
        opacity: 0.7;
      }

      &.running {
        icon-refresh();
      }
    }
  }

  span.no-queries {
    display: block;
    width: 100%;
    text-align: center;
    font-size: 20px;
    color: uber-black-60;
  }
}
</style>
