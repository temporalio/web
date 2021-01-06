<template>
  <transition name="fade">
    <div class="notification-bar" :class="type" v-if="show">
      <div class="message">
        {{ message }}
      </div>
      <span class="close icon icon_delete" @click="onClose" />
    </div>
  </transition>
</template>

<script>
export default {
  name: 'notification-bar',
  props: [
    'message',
    'onClose',
    'show',
    'type', // 'error', 'success', 'warning'
  ],
};
</script>

<style scoped lang="stylus">
UberGreen = #3AA76D;
UberRed = #D44333;
UberOrange = #ED6E33;
DefaultColor = UberGreen;

.close {
  position: absolute;
  right: 0;
  top: 0;
  padding: 12px;
  cursor: pointer;
}

.notification-bar {
  position: absolute;
  width: 600px
  max-width: calc(100% - 64px);
  max-height : 180px;
  right: 32px;
  bottom: 32px;
  padding: 16px 44px 16px 24px;
  font-size: 18px;
  line-height: 24px;
  background-color: DefaultColor;
  color: #fff;
  overflow: hidden;
  z-index: 1;
}

.error {
  background-color: UberRed;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}

.message {
  overflow: hidden;
  text-overflow: ellipsis;
}

.success {
  background-color: UberGreen;
}

.warning {
  background-color: UberOrange;
}
</style>
