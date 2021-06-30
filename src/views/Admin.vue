<template>
  <div class="container">
    <div class="row">
      <button @click="logout">Logout</button>
    </div>
    <router-view/>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  methods: {
    ...mapActions(["getCourses"]),
    logout() {
      this.$store.dispatch("logout");
    },
  },
  created() {
    this.getCourses();
  },
};
</script>