<template>
  <div class="container">
    <div class="card">
      <div class="card-image">
        <router-link to="/admin/course/new" class="btn-floating halfway-fab waves-effect waves-light blue">
          <i class="material-icons">add</i>
        </router-link>
      </div>
      <div class="card-content">
        <span class="card-title">Kurse</span>
        <ul class="collection">
          <li v-for="course in courses" :key="course.courseId" class="collection-item">
            <p><router-link :to="'/admin/course/' + course.courseId">{{ course.title }}</router-link></p>
            <p>{{ course.dateBegin | dayjs("DD.MM.YYYY") }} - {{ course.dateEnd | dayjs("DD.MM.YYYY")  }}</p>
            <p>{{ course.dayOfWeek | weekdayName}}</p>
            <p>{{ course.timeBegin | timejs("HH:mm")  }} - {{ course.timeEnd | timejs("HH:mm")}}</p>
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