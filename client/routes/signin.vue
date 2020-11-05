<template>
  <section>
    <div class="signin">
      <div v-if="currentUser">
        <img :src="currentUser.picture" width="200" alt="user pic" />
        <dl>
          <dt>Name</dt>
          <dd>{{ currentUser.name }}</dd>
          <dt>Email</dt>
          <dd>{{ currentUser.email }}</dd>
        </dl>

        <button class="close icon icon_delete" @click="logout">
          Log Out
        </button>
      </div>
      <div v-else>
        <button class="close icon icon_delete" @click="oidc">
          Sign in with SSO
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import { NavigationLink } from "~components";

export default {
  name: "signin",
  data() {
    return { currentUser: false };
  },
  mounted() {
    fetch("/api/me")
      .then(x => x.json())
      .then(x => (this.currentUser = x.user));
  },
  methods: {
    async logout() {
      window.location.assign("/auth/logout");
    },
    async oidc() {
      try {
        window.location.assign("/auth/sso");
      } catch (err) {
        console.error(err);
      }
    }
  }
};
</script>

<style lang="stylus">
@require '../styles/definitions.styl';

.signin {
  width: 300px;
  height: 400px;
}
</style>
