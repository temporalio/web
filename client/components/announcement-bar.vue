<template>
  <div
    data-color="announce"
    class="announcement-bar"
    :class="severity"
    v-if="show"
  >
    <a :href="link" target="_blank">
      <span class="message">
        {{ message }}
      </span>
    </a>
    <button class="close icon icon_delete" @click="onClose" />
  </div>
</template>

<script>
export default {
  name: 'notification-bar',
  props: ['message', 'link', 'show', 'severity', 'onClose'],
};
</script>

<style lang="stylus">
@require "../styles/definitions.styl"

.announcement-bar {
  background-color: temporal-blue
  padding: 0rem 3rem;

  font-size: 1rem;
  line-height: 1.5rem;
  padding: 0.25rem 0;
  text-align: center;
  color: temporal-spaceblack;

  &.high {
    background-color: uber-yellow
  }

  a {
    color: inherit;
  }

  .message {
    &:hover {
      color: tailwind-blue;
    }
  }

  .close {
    border: none;
    background: none;
    fill: none;
    font-size: 1rem;
    position: absolute;
    right: 0;
    top: 0;
    margin: 0.5rem;
  }
}
</style>
