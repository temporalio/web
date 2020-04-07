<template>
  <section class="namespace-search">
    <namespace-navigation type="text" placeholder="temporal-canary" />
  </section>
</template>

<script>
import { NamespaceNavigation } from '~components';

export default {
  data() {
    return {};
  },
  components: {
    'namespace-navigation': NamespaceNavigation,
  },
};
</script>

<style lang="stylus">
@require "../styles/definitions"

section.namespace-search
  margin layout-spacing-large
  @media (min-width 1600px)
    width 1580px
    margin 0 auto
    .namespace-navigation
      padding-left layout-spacing-medium
      padding-right layout-spacing-medium
  .links
    margin layout-spacing-large auto
    a
      display block
  h1
    margin-bottom base-font-size*2
  p, h3, .namespace-navigation
    margin 1em 0
  a
    line-height 2.5em
    &:nth-child(2n)
      background none
  .namespace-navigation
    div.input-and-validation
      align-items center
      .input-wrapper, p
        max-width 850px
        margin-left auto
        margin-right auto
    input
      margin 0
  .recent-namespaces
    li
      padding 0 inline-spacing-medium
</style>
