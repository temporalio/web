<template>
  <div class="data-viewer">
    <prism
      language="json"
      ref="codebox"
      class="code-preview"
      :style="maxLinesStl"
      >{{ fullview }}</prism
    >
    <a href="#" class="view-full-screen" @click.stop.prevent="viewFullScreen">
      OPEN
    </a>
  </div>
</template>

<script>
import 'prismjs';
import 'prismjs/components/prism-json';
import Prism from 'vue-prism-component';

export default {
  name: 'data-viewer',
  props: {
    item: [Object, Array, String, Number],
    title: String,
    maxLines: { type: Number, default: 3 },
  },
  data() {
    return {};
  },
  computed: {
    fullview() {
      return this.item ? JSON.stringify(this.item, null, 2) : '';
    },
    maxLinesStl() {
      return {
        'max-height': `${0.8 + this.maxLines}rem`,
      };
    },
  },
  methods: {
    viewFullScreen() {
      this.$modal.show(
        {
          components: { prism: Prism },
          props: ['code', 'title'],
          template: `
            <div class="data-viewer-fullscreen">
              <header>
                <h3>{{title}}</h3>
                <copy :text="code" />
                <a class="close" href="#" @click="$emit('close')"></a>
              </header>
              <prism language="json" class="code-fullscreen">{{code}}</prism>
            </div>
          `,
        },
        {
          code: this.item,
          title: this.title,
        },
        {
          name: 'data-viewer-fullscreen',
        }
      );
    },
  },
  components: {
    prism: Prism,
  },
};
</script>

<style lang="stylus">
@require "../styles/definitions.styl"

.data-viewer
  position relative
  display flex
  max-width: 40vw;
  .code-preview
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  &:not(:hover) a.view-full-screen
    display none
  a.view-full-screen
    position absolute
    top 3px
    right 0
    padding: 4px
    margin-right 10px
    height calc(100% - 6px)
    max-height 24px
    // border 1px solid uber-black-80
    // border-radius 4px
    background-color alpha(uber-white-20, 70%)
    display flex
    justify-content center
    align-items center
    icon('\ea90')
    &::before
      margin 0
      font-size 18px

[data-modal="data-viewer-fullscreen"]
  .v--modal-box.v--modal
    max-width calc(100vw - 20px)
    max-height calc(100vh - 20px)
  div.data-viewer-fullscreen
    flex-exactly-to-parent(column)
    pre
      flex 1
      overflow auto
      white-space : pre-wrap
    header
      padding-right 30px
      h3
        one-liner-ellipsis()
</style>
