<template>
  <section>
    <div class="signin">
      <button class="close icon icon_delete" @click="oidc">
        Sign in with SSO
      </button>
    </div>
  </section>
</template>

<script>
import { NavigationLink } from '~components';

export default {
  name: 'signin',
  created() {},
  methods: {
    async oidc() {
      try {
        window.location.assign('/auth/sso');
      } catch (err) {
        console.error(err);
      }
    },
  },
};
</script>

<style lang="stylus">
@require "../styles/definitions.styl"

.signin{
  width: 300px;
  height: 400px;
}
</style>
