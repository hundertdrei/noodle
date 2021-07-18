<template>
  <div class="container">
    <router-view/>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  methods: {
    ...mapActions(["getCourses"]),
  },
  created() {
    this.getCourses();
  },
};
</script>