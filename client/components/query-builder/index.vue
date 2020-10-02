<template>
  <div class="query-builder">
    <vue-query-builder :rules="rules" :maxDepth="2" v-model="query">
    </vue-query-builder>
  </div>
</template>

<script>
import moment from 'moment';
import vueSelect from 'vue-select';
import VueQueryBuilder from 'vue-query-builder';
import { TextInput } from '~components';
import { indexTypeToRule } from './helpers';

export default {
  props: ['searchAttributes'],
  data() {
    return {
      query: {},
      labels: {},
    };
  },
  computed: {
    rules() {
      const rules = Object.entries(this.searchAttributes.keys).map(
        ([key, value]) => ({
          id: key,
          label: key,
          ...indexTypeToRule(value),
        })
      );

      return rules;
    },
  },
  methods: {},
  watch: {},
  components: {
    VueQueryBuilder,
  },
};
</script>

<style lang="stylus"></style>

<style>
@import 'https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css';
</style>
