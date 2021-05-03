<template>
  <section class="workflow-summary" data-cy="summary">
    <aside class="actions">
      <feature-flag name="workflow-terminate">
        <a
          href=""
          class="terminate"
          v-show="showTerminate"
          @click.prevent="$modal.show('confirm-termination')"
          data-cy="open-terminate-dialog"
        >
          Terminate
        </a>
      </feature-flag>
      <feature-flag name="workflow-report-issue-url">
        <a :href="reportWorkflowIssueLink" class="report-issue" target="_blank">
          Report Issue
        </a>
      </feature-flag>
    </aside>

    <modal name="confirm-termination">
      <h3>Are you sure you want to terminate this workflow?</h3>
      <input
        v-model="terminationReason"
        placeholder="Reason"
        data-cy="termination-reason"
      />
      <footer>
        <a
          href="#"
          class="terminate"
          @click.prevent="terminate"
          data-cy="confirm-termination"
        >
          Terminate
        </a>
        <a
          href="#"
          class="cancel"
          @click.prevent="$modal.hide('confirm-termination')"
        >
          Cancel
        </a>
      </footer>
    </modal>

    <dl v-if="workflow">
      <div v-if="workflow.workflowExecutionInfo.isArchived">
        <h5>Workflow archived</h5>
        <p>
          This workflow has been retrieved from archival. Some summary
          information may be missing.
        </p>
      </div>
      <div class="workflow-name" data-cy="workflow-name">
        <dt>Workflow Name</dt>
        <dd>{{ workflow.workflowExecutionInfo.type.name }}</dd>
      </div>
      <div class="started-at" data-cy="started-at">
        <dt>Started At</dt>
        <dd>{{ workflowStartTime }}</dd>
      </div>
      <div class="close-time" v-if="workflowCloseTime" data-cy="closed-at">
        <dt>Closed Time</dt>
        <dd>{{ workflowCloseTime }}</dd>
      </div>
      <div
        class="workflow-status"
        :data-status="
          wfStatus !== undefined &&
            (typeof wfStatus === 'string' ? wfStatus : wfStatus.status)
        "
        data-cy="workflow-status"
      >
        <dt>Status</dt>
        <dd>
          <bar-loader v-if="wfStatus === 'running'" />
          <span v-if="typeof wfStatus === 'string'">{{ wfStatus }}</span>
          <router-link
            v-if="wfStatus !== undefined && wfStatus.to"
            :to="wfStatus.to"
          >
            {{ wfStatus.text }}
          </router-link>
        </dd>
      </div>
      <div class="workflow-id" data-cy="workflow-id">
        <dt>Workflow Id</dt>
        <dd>{{ workflowId }}</dd>
      </div>
      <div class="run-id" data-cy="run-id">
        <dt>Run Id</dt>
        <dd>{{ runId }}</dd>
      </div>
      <div class="workflow-input" data-cy="workflow-input">
        <dt>Input</dt>
        <dd>
          <data-viewer
            v-if="input !== undefined"
            :item="input"
            :title="workflowId + ' Input'"
            :maxLines="10"
          />
        </dd>
      </div>
      <div class="workflow-result" v-if="resultView" data-cy="workflow-result">
        <dt>Result</dt>
        <dd>
          <data-viewer
            :item="resultView"
            :title="workflowId + ' Result'"
            :maxLines="10"
          />
        </dd>
      </div>
      <div
        class="parent-workflow"
        v-if="parentWorkflowRoute"
        data-cy="parent-workflow"
      >
        <dt>Parent Workflow</dt>
        <dd>
          <router-link :to="parentWorkflowRoute.to">
            {{ parentWorkflowRoute.text }}
          </router-link>
        </dd>
      </div>
      <div class="task-queue" data-cy="task-queue">
        <dt>Task Queue</dt>
        <dd>
          <router-link
            :to="{
              name: 'task-queue',
              params: {
                taskQueue: workflow.executionConfig.taskQueue.name,
              },
            }"
          >
            {{ workflow.executionConfig.taskQueue.name }}
          </router-link>
        </dd>
      </div>
      <div class="history-length" data-cy="history-length">
        <dt>History Events</dt>
        <dd>{{ workflow.workflowExecutionInfo.historyLength }}</dd>
      </div>
      <div
        class="pending-activities"
        v-if="workflow.pendingActivities"
        data-cy="pending-activities"
      >
        <dt>Pending Activities</dt>
        <dd v-for="pa in workflow.pendingActivities" :key="pa.activityId">
          <detail-list :item="pa" />
        </dd>
      </div>
    </dl>
  </section>
</template>

<script>
import { getReportIssueLink } from './helpers';
import { TERMINATE_DEFAULT_ERROR_MESSAGE } from './constants';
import { NOTIFICATION_TYPE_ERROR, NOTIFICATION_TYPE_SUCCESS } from '~constants';
import { BarLoader, DataViewer, DetailList, FeatureFlag } from '~components';
import { getErrorMessage } from '~helpers';

export default {
  data() {
    return {
      terminationReason: undefined,
      webSettingsCache: undefined,
    };
  },
  props: [
    'baseAPIURL',
    'input',
    'isWorkflowRunning',
    'parentWorkflowRoute',
    'result',
    'runId',
    'wfStatus',
    'workflow',
    'workflowId',
  ],
  components: {
    'bar-loader': BarLoader,
    'data-viewer': DataViewer,
    'detail-list': DetailList,
    'feature-flag': FeatureFlag,
  },
  created() {
    this.namespaceDescCache = {};
    this.getWebSettings();
  },
  computed: {
    workflowCloseTime() {
      return this.workflow.workflowExecutionInfo.closeTime
        ? this.workflow.workflowExecutionInfo.closeTime.format(
            'dddd MMMM Do, h:mm:ss a'
          )
        : '';
    },
    workflowStartTime() {
      return this.workflow.workflowExecutionInfo.startTime.format(
        'dddd MMMM Do, h:mm:ss a'
      );
    },
    resultView() {
      return this.result?.failure ? this.result?.failure : this.result;
    },
    showTerminate() {
      return this.isWorkflowRunning && this.webSettingsCache?.permitWriteApi;
    },
    reportWorkflowIssueLink() {
      return getReportIssueLink({
        workflow: this.workflow,
        workflowId: this.workflowId,
        runId: this.runId,
        input: JSON.stringify(this.input, null, 2),
        result: JSON.stringify(this.resultView, null, 2),
        href: window.location.href,
      });
    },
  },
  methods: {
    terminate() {
      this.$modal.hide('confirm-termination');
      this.$http
        .post(`${this.baseAPIURL}/terminate`, {
          reason: this.terminationReason,
        })
        .then(
          r => {
            this.$emit('onNotification', {
              message: 'Workflow terminated.',
              type: NOTIFICATION_TYPE_SUCCESS,
            });
            // eslint-disable-next-line no-console
            console.dir(r);
          },
          error => {
            this.$emit('onNotification', {
              message: getErrorMessage(error, TERMINATE_DEFAULT_ERROR_MESSAGE),
              type: NOTIFICATION_TYPE_ERROR,
            });
          }
        );
    },
    getWebSettings() {
      if (this.webSettingsCache) {
        return Promise.resolve(this.webSettingsCache);
      }

      return this.$http(`/api/web-settings`).then(r => {
        this.webSettingsCache = r;

        return this.webSettingsCache;
      });
    },
  },
};
</script>

<style lang="stylus">
@require "../../styles/definitions.styl"

section.workflow-summary
  overflow auto
  padding layout-spacing-small

  .pending-activities {
    dl.details {
      dd {
        white-space: normal;
      }
    }
  }

  dl:not(.details)
    & > div
      margin-bottom 1em
      & > dt
        text-transform uppercase
        font-size 11px
      dd, dt
        line-height 1.5em
  dl.details
    border 1px solid uber-black-60
    margin-bottom 1em
    dt
      padding 0 4px
  .run-id, .task-queue, .workflow-id, .workflow-name
    dd
      font-weight 300
      font-family monospace-font-family
  .workflow-status
    dd
      text-transform capitalize
    &[data-status="completed"] dd
      color uber-green
    &[data-status="failed"] dd
      color uber-orange
  pre
    max-height 18vh

  aside.actions
    width 100%
    display flex
    position absolute
    justify-content flex-end
    right 18px

    a.report-issue
      action-button(uber-white-120)
      margin-left 16px
      text-align center

      &::after
        content ''
    a.terminate
      action-button(uber-orange)

[data-modal="confirm-termination"]
  input
    margin layout-spacing-medium 0
  footer
    display flex
    justify-content space-between
  a.terminate
    action-button(uber-orange)
  a.cancel
    action-button()
</style>
