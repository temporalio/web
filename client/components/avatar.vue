<template>
  <div class="avatar">
    <div class="picture">
      <img
        v-if="picture"
        :src="picture"
        alt="user pic"
        :style="{ width: pictureSize || '2rem', height: pictureSize || '2rem' }"
      />
      <i
        v-else
        class="icon icon_profile"
        :style="{ width: pictureSize || '2rem', height: pictureSize || '2rem' }"
      />
    </div>
    <span class="name">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: 'avatar',
  props: ['label', 'picture', 'pictureSize'],
};
</script>

<style scoped lang="stylus">
@require "../styles/definitions"
.avatar {
    display flex
    margin-left auto
    align-items center
    color: white
}

.picture
    display inline-block
    margin: 0.5rem

    img,
    i {
        border-radius 500rem
    }
    i {
        display: inline-flex;
        background-color: temporal-purple ;
        color: black;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
    }
</style>
