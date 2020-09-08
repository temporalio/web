<template>
  <div class="archival-disabled-messaging">
    <div class="message-group">
      <p>
        This namespace is currently not enabled for archival.
      </p>
      <div v-if="historyArchivalLinks">
        <div v-for="(link, index) in historyArchivalLinks" :key="index">
          <a :href="link.href" rel="noopener noreferrer" target="_blank">
            {{ link.label }}
          </a>
        </div>
      </div>
    </div>
    <div v-if="!isHistoryArchivalEnabled" class="message-group">
      <p>
        Run this command to enable Archival for Event Histories:
      </p>
      <code lang="bash" v-if="historyArchivalEnableCommand">{{
        historyArchivalEnableCommand
      }}</code>
    </div>
    <div v-if="!isVisibilityArchivalEnabled" class="message-group">
      <p>
        To enable Visibility Archival:
      </p>
      <code lang="bash" v-if="visibilityArchivalEnableCommand">{{
        visibilityArchivalEnableCommand
      }}</code>
    </div>
    <div class="message-group">
      <p class="docs">
        For more details please check out
        <a href="https://docs.temporal.io/docs/archive-data/" target="_blank"
          >Archival Docs</a
        >
      </p>
    </div>
  </div>
</template>

<script>
import {
  isHistoryArchivalEnabled,
  isVisibilityArchivalEnabled,
  replaceNamespace,
} from '../../helpers';
import {
  historyArchivalEnableCommand,
  historyArchivalLinks,
  visibilityArchivalEnableCommand,
} from './constants';

export default {
  name: 'archival-disabled-messaging',
  props: ['namespaceSettings'],
  data() {
    return {
      historyArchivalLinks,
    };
  },
  computed: {
    isHistoryArchivalEnabled() {
      return isHistoryArchivalEnabled(this.namespaceSettings);
    },
    isVisibilityArchivalEnabled() {
      return isVisibilityArchivalEnabled(this.namespaceSettings);
    },
    historyArchivalEnableCommand() {
      return replaceNamespace(
        historyArchivalEnableCommand,
        this.namespaceSettings
      );
    },
    visibilityArchivalEnableCommand() {
      return replaceNamespace(
        visibilityArchivalEnableCommand,
        this.namespaceSettings
      );
    },
  },
};
</script>

<style lang="stylus">
.archival-disabled-messaging {
  padding: 10px 50px;

  .message-group {
    margin: 20px 0;

    p {
      font-size: 20px;
      line-height: 36px;
      margin-bottom: 5px;
      &.docs {
        font-size: 18px;
      }
    }

    code {
      border: 1px black;
      border-style: solid;
      padding: 4px;
    }
  }
}
</style>
