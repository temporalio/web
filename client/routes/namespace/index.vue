<template>
  <section>
    <navigation-bar>
      <navigation-link
        icon="icon_search"
        label="Workflows"
        :to="{ name: 'workflow-list' }"
      />
      <navigation-link
        label="Settings"
        icon="icon_settings"
        :to="{ name: 'namespace-settings' }"
      />
    </navigation-bar>
    <router-view name="workflow-list" :namespace="namespace" />
    <router-view name="namespace-settings" :namespace="namespace" />
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
};
</script>

<style lang="stylus"></style>
