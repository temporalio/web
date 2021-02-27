<template>
  <section class="signin">
    <div class="signin-form">
      <avatar
        :picture="
          currentUser && currentUser.picture
            ? currentUser.picture
            : temporalLogo
        "
        pictureSize="6rem"
      />
      <div>
        <dl v-if="currentUser" class="user-details">
          <dd>
            <b>{{ currentUser.name }}</b>
          </dd>
          <dd v-if="currentUser.name !== currentUser.email">
            {{ currentUser.email }}
          </dd>
        </dl>
        <h2 v-else class="vert-space-4"><b>Sign in to Temporal</b></h2>
      </div>
      <div class="vert-space-4">
        <button
          class="close icon icon_delete"
          @click="logout"
          v-if="currentUser"
        >
          Sign Out
        </button>
        <button class="close icon icon_key" @click="oidc" v-else>
          Continue to SSO
        </button>
      </div>
    </div>
  </section>
</template>

<script>
import temporalLogo from '../assets/logo-rounded.png';
import { NavigationLink, Avatar } from '~components';

export default {
  components: {
    avatar: Avatar,
  },
  name: 'signin',
  data() {
    return { currentUser: false, temporalLogo };
  },
  async created() {
    const me = await this.$http('/api/me');

    this.currentUser = me.user;
  },
  methods: {
    async logout() {
      window.location.assign('/auth/logout');
    },
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
@require '../styles/definitions.styl';
.vert-space-4 {
  margin-top : 20px
}
.signin {
  display: flex
  justify-content: center
  align-items: center

  .user-details {
    dd {
      width: 100%;
      text-align: center;
    }
  }

  .signin-form {
    padding: 20px;
    display: flex;
    flex-direction: column;
    border: 1px solid #d8dee2;
    width: 380px;
    align-items: center


    div {
      width: 100%;
      display: flex
      justify-content: center
      align-items: center
    }

    .avatar {
        padding: 1rem
    }

    button{
      width: 100%
      height: 40px
    }
  }
}
</style>
