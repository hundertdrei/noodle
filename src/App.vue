<template>
  <div id="app">
    <nav>
      <div class="nav-wrapper green">
        <a href="#" class="brand-logo right">Logo</a>
        <a href="#" data-target="mobile-demo" class="sidenav-trigger"
          ><i class="material-icons">menu</i></a
        >
        <ul id="nav-mobile" class="left hide-on-med-and-down">
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/admin">Admin</router-link></li>
        </ul>
      </div>
    </nav>

    <ul class="sidenav" ref="sidenav" id="mobile-demo">
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/admin">Admin</router-link></li>
    </ul>

    <router-view />
  </div>
</template>

<script>
import M from "materialize-css";

export default {
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
  margin-bottom: 2em;
}
</style>
