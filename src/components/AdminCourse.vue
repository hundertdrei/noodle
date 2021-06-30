<template>
  <div class="container">
    <div class="card" v-if="course">
      <div class="card-content">
        <span class="card-title">{{ course.title }} ({{ course.titleShort }})</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: ["id"],
  computed: {
    ...mapState(["courses"]),
    course() {
      let f = this.courses.filter((o) => o.courseId == this.id);
      if (f.length > 0) return f[0];
      else return null;
    },
  },
};
</script>