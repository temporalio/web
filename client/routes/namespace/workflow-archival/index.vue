<template>
  <section class="workflow-archival" :class="{ loading }">
    <archival-disabled-messaging
      v-if="!loading && !isArchivalEnabled"
      :namespace-settings="namespaceSettings"
    />
    <router-view
      name="workflow-archival-advanced"
      v-if="!loading && isArchivalEnabled"
      :namespace="namespace"
    />
    <router-view
      name="workflow-archival-basic"
      v-if="!loading && isArchivalEnabled"
      :namespace="namespace"
    />
  </section>
</template>

<script>
import NamespaceService from '../namespace-service';
import { isArchivalEnabled } from './helpers';
import { ArchivalDisabledMessaging } from './components';

export default {
  name: 'workflow-archival',
  props: ['namespace'],
  data() {
    return {
      namespaceSettings: {},
      loading: true,
    };
  },
  async created() {
    const namespaceService = NamespaceService();

    this.namespaceSettings = await namespaceService.getNamespaceSettings(
      this.namespace
    );
    this.loading = false;
  },
  computed: {
    isArchivalEnabled() {
      return isArchivalEnabled(this.namespaceSettings);
    },
  },
  components: {
    'archival-disabled-messaging': ArchivalDisabledMessaging,
  },
};
</script>

<style lang="stylus">
section.workflow-archival {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  overflow-y: auto;
}
</style>
