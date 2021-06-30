<template>
  <div class="container">
    <div class="card">
      <div class="card-content">
        <span class="card-title">Kurse</span>
        <ul class="collection">
          <li v-for="course in courses" :key="course.courseId" class="collection-item">
            <router-link :to="'/admin/course/' + course.courseId">{{ course.title }}</router-link>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  computed: {
    ...mapState(["courses"])
  },
  methods: {
    logout () {
      this.$store.dispatch('logout');
    }
  },
}
</script>