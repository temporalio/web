<template>
  <section class="namespace">
    <navigation-bar>
      <navigation-link
        icon="icon_search"
        label="Workflows"
        :to="{ name: 'workflow-list' }"
      />
      <navigation-link
        label="Settings"
        data-cy="namespace-settings-link"
        icon="icon_settings"
        :to="{ name: 'namespace-settings' }"
      />
      <navigation-link
        label="Archival"
        icon="icon_trip-history"
        :to="{ name: 'workflow-archival' }"
      />
      <span class="bugreport">
        <a target="_blank" :href="issueReportLink">
          Report Bug/Give Feedback
        </a>
      </span>
    </navigation-bar>
    <router-view name="workflow-list" :namespace="namespace" />
    <router-view name="namespace-settings" :namespace="namespace" />
    <router-view name="workflow-archival" :namespace="namespace" />
  </section>
</template>

<script>
import { NavigationBar, NavigationLink } from '~components';

export default {
  props: ['namespace'],
  components: {
    'navigation-bar': NavigationBar,
    'navigation-link': NavigationLink,
  },
  data() {
    return {
      webSettings: undefined,
    };
  },
  async created() {
    await this.getWebSettings();
  },
  computed: {
    issueReportLink() {
      if (!this.webSettings?.routing?.issueReportLink) {
        return 'https://github.com/temporalio/web/issues/new/choose';
      }

      return this.webSettings.routing.issueReportLink;
    },
  },
  methods: {
    async getWebSettings() {
      if (this.webSettings) {
        return this.webSettings;
      }

      this.webSettings = await this.$http(`/api/web-settings`);
    },
  },
};
</script>

<style lang="stylus">
section.namespace {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  overflow-y: auto;
  position: relative
}
.bugreport {
  position: absolute;
  right: 1em;
  top: 0.75em;
}
</style>
