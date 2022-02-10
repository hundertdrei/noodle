<template>
  <div id="app" class="grey lighten-3">
    <nav class="nav-extended">
      <div class="nav-wrapper theme-background">
        <a href="#" class="brand-logo right">
          <i class="material-icons">local_dining</i>
        </a>
        <a href="#" data-target="mobile-demo" class="sidenav-trigger"
          ><i class="material-icons">menu</i></a
        >
        <ul id="nav-mobile" class="left hide-on-med-and-down">
          <li><router-link to="/">Home</router-link></li>
          <li v-if="authenticated"><router-link to="/admin/courses">Admin</router-link></li>
        </ul>
      </div>

      <div class="nav-content light-blue darken-2" v-if="adminArea">
        <ul class="tabs tabs-transparent">
          <li class="tab"><router-link to="/admin/courses">Kurse</router-link></li>
          <li class="tab"><router-link to="/admin/seasons">Saisons</router-link></li>
        </ul>
      </div>
    </nav>

    <ul class="sidenav" ref="sidenav" id="mobile-demo">
      <li><router-link to="/">Home</router-link></li>
      <li v-if="authenticated"><router-link to="/admin">Admin</router-link></li>
    </ul>

    <div class="container" v-if="!adminArea">
      <div class="row">
        <div class="col s12">
          <div class="card">
                <div class="splash"></div>
          </div>
        </div>
      </div>
    </div>

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
    ...mapState('auth', ['authenticated']),
    adminArea () {
      return this.$route.matched.some(({path}) => path == '/admin')
    }
  },
  methods: {
    ...mapActions('auth', ['logout'])
  },
  mounted () {
    let elem = this.$refs["sidenav"];

    M.Sidenav.init(elem);

    // Copy noodle color defined in SCSS into 'theme-color' meta attribute
    var noodle_color = getComputedStyle(document.body).getPropertyValue("--noodle-color");
    document.head.innerHTML += `<meta name="theme-color" content="${noodle_color}" />`;
  },
};
</script>

<style lang="scss">
$noodle-color: #01579b;

:root {
  --noodle-color: #{$noodle-color};
}

$secondary-color: $noodle-color;

@import "~materialize-css";
$material-design-icons-font-path: '~@material-design-icons/font/';
@import "~@material-design-icons/font/filled.css";

.theme-background {
  background: var(--noodle-color);
}

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

$splashMargin: 32px;

.splash {
    background: url('./assets/Touched_1600.jpg') center 40% / cover;
    min-height: 200px;
}

@media screen and (max-width:(1280px + $splashMargin)) and (max-resolution:1dppx),
  screen and (max-width:(640px + $splashMargin)) and (max-resolution:2dppx),
  screen and (max-width:(427px + $splashMargin)) and (max-resolution:3dppx) {
    .splash {
        background-image: url('./assets/Touched_1280.jpg');
    }
}

@media screen and (max-width:(1080px + $splashMargin)) and (max-resolution:1dppx),
  screen and (max-width:(540px + $splashMargin)) and (max-resolution:2dppx),
  screen and (max-width:(360px + $splashMargin)) and (max-resolution:3dppx) {
    .splash {
        background-image: url('./assets/Touched_1080.jpg');
    }
}

@media screen and (max-width:(800px + $splashMargin)) and (max-resolution:1dppx),
  screen and (max-width:(400px + $splashMargin)) and (max-resolution:2dppx) {
    .splash {
        background-image: url('./assets/Touched_800.jpg');
    }
}

@media screen and (max-width:(540px + $splashMargin)) and (max-resolution:1dppx) {
    .splash {
        background-image: url('./assets/Touched_540.jpg');
    }
}

@media screen and (max-width:(400px + $splashMargin)) and (max-resolution:1dppx) {
    .splash {
        background-image: url('./assets/Touched_400.jpg');
    }
}
</style>
