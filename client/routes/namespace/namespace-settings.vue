<template>
  <section
    class="namespace-settings namespace-description"
    :class="{ loading }"
    data-cy="namespace-settings"
  >
    <header>
      <h3>{{ namespace }}</h3>
    </header>
    <detail-list
      v-if="namespaceConfig"
      :item="namespaceConfig"
      :title="`Namespace ${namespace} Configuration`"
    />
    <span class="error" v-if="error">{{ error }}</span>
  </section>
</template>

<script>
import { getKeyValuePairs, mapNamespaceDescription } from '~helpers';
import { DetailList } from '~components';

export default {
  data() {
    return {
      error: undefined,
      loading: true,
      namespaceConfig: undefined,
    };
  },
  props: ['namespace'],
  components: {
    'detail-list': DetailList,
  },
  created() {
    this.$http(`/api/namespaces/${this.namespace}`)
      .then(
        r => {
          const namespaceConfig = mapNamespaceDescription(r);
          const kvps = getKeyValuePairs(namespaceConfig);

          this.namespaceConfig = { ...namespaceConfig, kvps };
        },
        res => {
          this.error = `${res.statusText || res.message} ${res.status}`;
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

section.namespace-settings
  .foobar
    display none
</style>
