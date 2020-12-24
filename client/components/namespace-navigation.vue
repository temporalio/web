<template>
  <div class="namespace-navigation" :class="'validation-' + validation">
    <div class="input-and-validation">
      <div class="input-wrapper">
        <input
          type="text"
          name="namespace"
          spellcheck="false"
          autocorrect="off"
          ref="input"
          v-bind:value="d"
          :placeholder="$props.placeholder"
          @input="onInput"
          @keydown.enter="changeNamespace"
          @keydown.esc="onEsc"
        />
        <a
          :href="validation === 'valid' ? '#' : ''"
          class="change-namespace"
          @click="changeNamespace"
        ></a>
      </div>
      <p :class="'validation validation-' + validation">
        {{ validationMessage }}
      </p>
    </div>
    <ul
      class="recent-namespaces"
      v-if="recentNamespaces.length"
      data-cy="recent-namespaces"
    >
      <h3>Recent Namespaces</h3>
      <li v-for="namespace in recentNamespaces" :key="namespace">
        <a
          :href="namespaceLink(namespace)"
          :data-namespace="namespace"
          @click="navigateFromClick"
          @mouseover="showNamespaceDesc(namespace)"
          >{{ namespace }}</a
        >
      </li>
    </ul>
    <div
      :class="{
        'namespace-description': true,
        pending: !!namespaceDescRequest,
      }"
      v-if="namespaceDesc"
      data-cy="namespace-description"
    >
      <span class="namespace-name">{{ namespaceDescName }}</span>
      <detail-list :item="namespaceDesc" :title="namespaceDescName" />
    </div>
  </div>
</template>

<script>
import debounce from 'lodash-es/debounce';
import omit from 'lodash-es/omit';
import { stringify } from 'friendly-querystring';
import { getKeyValuePairs, mapNamespaceDescription } from '~helpers';
import { DetailList } from '~components';

const validationMessages = {
  valid: (d) => `${d} exists`,
  invalid: (d) => `${d} does not exist`,
  error: (d) => `An error occoured while querying for ${d}`,
};

export default {
  props: ['namespace', 'placeholder'],
  data() {
    return {
      d: this.$props.namespace,
      validation: 'unknown',
      validationMessage: undefined,
      recentNamespaces: [],
      namespaceDesc: undefined,
      namespaceDescName: undefined,
      namespaceDescRequest: undefined,
    };
  },
  components: {
    'detail-list': DetailList,
  },
  async created() {
    this.namespaceDescCache = {};

    await this.getNamespaces();
    if (this.recentNamespaces.length == 1) {
      const namespace = this.recentNamespaces[0];
      const url = this.namespaceLink(namespace);

      this.$router.push(url);
    }
  },
  methods: {
    changeNamespace() {
      if (this.validation === 'valid') {
        this.$router.push({
          path: `/namespaces/${this.d}/workflows`,
          query: omit(
            this.$router.currentRoute.query,
            'workflowId',
            'runId',
            'workflowName'
          ),
        });
        this.$emit('navigate', this.d);
      }
    },
    namespaceLink(d) {
      return `/namespaces/${d}/workflows?${stringify(
        this.$router.currentRoute.query
      )}`;
    },
    navigateFromClick(e) {
      const namespace = e.target.getAttribute('data-namespace');
      this.$emit('navigate', namespace);
    },
    getNamespaceDesc(d) {
      if (this.namespaceDescCache[d]) {
        return Promise.resolve(this.namespaceDescCache[d]);
      }

      return this.$http(`/api/namespaces/${d}`).then((r) => {
        this.namespaceDescCache[d] = mapNamespaceDescription(r);

        return this.namespaceDescCache[d];
      });
    },
    getNamespaces(d) {
      return this.$http(`/api/namespaces`).then((r) => {
        const namespaces = r.namespaces.map((n) => n.namespaceInfo.name);

        const newNamespaces = namespaces
          .filter((n) => !this.recentNamespaces.includes(n))
          .filter((n) => n !== 'temporal-system');

        this.recentNamespaces = newNamespaces;
      });
    },
    checkValidity: debounce(function checkValidity() {
      const check = (newNamespace) => {
        this.validation = 'pending';
        this.namespaceDescRequest = this.getNamespaceDesc(newNamespace)
          .then(
            (desc) => {
              this.namespaceDescName = newNamespace;
              this.namespaceDesc = {
                kvps: getKeyValuePairs(desc),
              };

              return 'valid';
            },
            (res) => (res.status === 404 ? 'invalid' : 'error')
          )
          .then((v) => {
            this.$emit('validate', this.d, v);

            if (v in validationMessages) {
              this.validationMessage = validationMessages[v](this.d);
            }

            if (this.d === newNamespace || !this.d) {
              this.validation = this.d ? v : 'unknown';
              this.namespaceDescRequest = null;
            } else {
              check.call(this, this.d);
            }
          });
      };

      if (!this.namespaceDescRequest && this.d) {
        check(this.d);
      }
    }, 300),
    onInput() {
      this.d = this.$refs.input.value;
      this.checkValidity();
    },
    showNamespaceDesc(d) {
      this.namespaceDescName = d;
      this.namespaceDescRequest = this.getNamespaceDesc(d)
        .catch((res) => ({
          error: `${res.statusText || res.message} ${res.status}`,
        }))
        .then((desc) => {
          if (this.namespaceDescName === d) {
            this.namespaceDesc = {
              kvps: getKeyValuePairs(desc),
            };
            this.namespaceDescRequest = null;
          }
        });
    },
    onEsc(e) {
      this.$emit('cancel', e);
    },
  },
};
</script>

<style lang="stylus">
@require "../styles/definitions.styl"

validation(color, symbol)
  input
    border-color color
    &:focus
      outline color auto 2px
  &::after
    background-color color
    content symbol

.namespace-navigation
  display flex
  flex-wrap wrap
  change-namespace-size = 32px

  div.input-and-validation
    flex 0 0 100%
    div.input-wrapper
      display flex
      position relative
      align-items center
      &::after
        position absolute
        right 18px + change-namespace-size + inline-spacing-small
        font-size 11px
        size = 16px
        width size
        height size
        border-radius size
        top "calc(50% - %s)" % (size/2)
        color white
        display flex
        justify-content center
        align-items center
    input
      flex 1 1 auto
  &.validation-invalid .input-wrapper
    validation(uber-orange, '✕')
  &.validation-valid .input-wrapper
    validation(uber-green, '✔')
  &.validation-pending .input-wrapper::after
    background none
    border 2px solid uber-black-40
    border-bottom-color transparent
    animation spin 600ms linear infinite
    content ' '
  .validation-message
    line-height 1.5em

  ul.recent-namespaces
    flex 1 1 auto

  a.change-namespace
    icon('\ea87')
    margin-left inline-spacing-small
    &::before
      display inline-block
      width change-namespace-size
      height change-namespace-size
      line-height change-namespace-size
      text-align center
      color white
      background-color uber-white-80
      border-radius change-namespace-size
    &[href='#']::before
      background-color primary-color

.namespace-description
  flex 1 1 60%
  padding layout-spacing-small
  span.namespace-name
    display inline-block
    font-size 18px
    padding inline-spacing-small
    font-family monospace-font-family
  &.pending dl.details
    opacity 0.2
  dl.details
    & > div
      display block
      padding inline-spacing-small
    dt, dd
      line-height 1.5em
    dt
      text-transform uppercase
      font-family primary-font-family
      font-weight 200
</style>
