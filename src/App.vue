<template>
  <div id="app" class="grey lighten-3">
    <nav>
      <div class="nav-wrapper green">
        <a href="#" class="brand-logo right">
          <i class="material-icons">local_dining</i>
        </a>
        <a href="#" data-target="mobile-demo" class="sidenav-trigger"
          ><i class="material-icons">menu</i></a
        >
        <ul id="nav-mobile" class="left hide-on-med-and-down">
          <li><router-link to="/">Home</router-link></li>
          <li v-if="authenticated"><router-link to="/admin">Admin</router-link></li>
        </ul>
      </div>
    </nav>

    <ul class="sidenav" ref="sidenav" id="mobile-demo">
      <li><router-link to="/">Home</router-link></li>
      <li v-if="authenticated"><router-link to="/admin">Admin</router-link></li>
    </ul>

    <router-view />

    <footer class="page-footer grey darken-4">
      <a v-if="authenticated" @click="logout">Logout</a>
      <router-link v-else to="/login">Login</router-link>
    </footer>
  </div>
</template>

<script>
import M from "materialize-css";
import { mapState, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState('auth', ['authenticated'])
  },
  methods: {
    ...mapActions('auth', ['logout'])
  },
  mounted () {
    let elem = this.$refs["sidenav"];
    M.Sidenav.init(elem);
  },
};
</script>

<style lang="scss">
$secondary-color: green;

@import "~materialize-css";
@import "~material-design-icons/iconfont/material-icons.css";

.text-bold {
  font-weight: bold;
}

hr {
  background-color: #e0e0e0;
  border: 0;
  height: 1px;
  margin: 0.7em 0;
}

nav {
  margin-bottom: 3em;
}

a {
  cursor: pointer;
}

html, body {
  height: 100%;
}

#app {
  min-height: 100%;
}

footer {
  padding: 2em;
  text-align: center;
  margin-top: 3em;
}

footer a {
  color: white;
}
</style>
