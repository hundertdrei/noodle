<template>
  <div class="container">
    <div class="card" v-if="course">
      <div class="card-content">
        <span class="card-title">{{ course.title }} ({{ course.titleShort }})</span>
        <div>Ort: {{ course.location }}</div>
        <div>Zeitraum: {{ course.dateBegin | dayjs("DD.MM.YYYY") }} bis {{ course.dateEnd | dayjs("DD.MM.YYYY")}}</div>
        <div>Wochentag: {{ course.dayOfWeek | weekdayName }}</div>
        <div>Uhrzeit: {{ course.timeBegin | timejs("HH:mm") }} - {{ course.timeEnd | timejs("HH:mm") }}</div>
        <div>Kommentar: {{ course.comment }}</div>
      </div>
      <div class="card-action">
        <router-link class="green-text" :to="`/admin/course/${course.courseId}/edit`">Bearbeiten</router-link>
        <a class="blue-text" @click="fillTrainings(course.courseId)">Termine füllen</a>
        <a class="red-text" @click="deleteCourseLocal(course.courseId)">Löschen</a>
      </div>
    </div>
    <div class="card">
      <div class="card-content">
        <span class="card-title">Termine</span>
        <ul class="collection">
          <li  v-for="training in course.trainings" :key="training.trainingId" class="collection-item">
          {{ training.trainingDate | dayjs('dddd, DD.MM.YYYY')}}
          <span class="secondary-content"><i class="material-icons">more_vert</i></span>
          </li>
          <li v-if="course.trainings.length == 0" clasS="collection-item">
            <i>Noch keine Termine vorhanden</i>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

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
  methods: {
    ...mapActions(['fillTrainings', 'deleteCourse']),
    async deleteCourseLocal (courseId) {
      await this.deleteCourse(courseId);

      this.$router.push('/admin')
    }
  }
};
</script>