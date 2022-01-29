<template>
  <div class="container">
    <div class="row">
      <div class="col s12">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  methods: {
    ...mapActions(["getCourses", "getMilestones"]),
  },
  created() {
    this.getCourses();
    this.getMilestones();
  },
};
</script>