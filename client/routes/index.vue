<template>
  <section>
    <navigation-bar>
      <navigation-link
        :exact="true"
        icon="icon_search"
        label="Namespaces"
        :to="{ name: 'namespace-list' }"
      />
      <navigation-link label="Help" icon="icon_help" :to="{ name: 'help' }" />
    </navigation-bar>
    <router-view name="namespace-list" />
    <router-view name="help" />
  </section>
</template>

<script>
import { NavigationBar, NavigationLink } from '~components';

export default {
  components: {
    'navigation-bar': NavigationBar,
    'navigation-link': NavigationLink,
  },
};
</script>

<style lang="stylus"></style>
