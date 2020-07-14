<template>
  <section :class="{ 'task-queue': true, loading }">
    <header><h3>Pollers</h3></header>
    <table v-if="pollers">
      <thead>
        <th>Identity</th>
        <th>Last Access Time</th>
        <th>Workflow Task Handler</th>
        <th>Activity Handler</th>
      </thead>
      <tbody>
        <tr v-for="p in pollers" :key="p.identity">
          <td>{{ p.identity }}</td>
          <td>{{ p.lastAccessTime.format('ddd MMMM Do, h:mm:ss a') }}</td>
          <td class="workflowTask" :data-handled="p.handlesWorkflowTasks"></td>
          <td class="activity" :data-handled="p.handlesActivities"></td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script>
import moment from 'moment';

export default {
  data() {
    return {
      pollers: undefined,
      error: undefined,
      loading: true,
    };
  },
  created() {
    this.$http(
      `/api/namespaces/${this.$route.params.namespace}/task-queues/${this.$route.params.taskQueue}/pollers`
    )
      .then(
        (p) => {
          this.pollers = Object.keys(p).map((identity) => ({
            identity,
            lastAccessTime: moment(p[identity].lastAccessTime),
            handlesCommands: p[identity].taskQueueTypes.includes('command'),
            handlesActivities: p[identity].taskQueueTypes.includes('activity'),
          }));
        },
        (e) => {
          this.error = (e.json && e.json.message) || e.status || e.message;
        }
      )
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {},
};
</script>

<style lang="stylus">
@require "../../styles/definitions.styl"

section.task-queue
  > header
    padding inline-spacing-medium
  table
    max-width 1600px
  td:nth-child(3), td:nth-child(4)
    width 230px
  td[data-handled="true"]
    padding-left 75px
    icon-check()
</style>
