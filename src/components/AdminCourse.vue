<template>
  <div>
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
          <AdminTraining v-for="training in trainings" :key="training.trainingId" :training="training" :course="course"/>
          <li v-if="trainings.length == 0" clasS="collection-item">
            <i>Noch keine Termine vorhanden</i>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import AdminTraining from '@/components/AdminTraining'
import _ from 'lodash'

export default {
  props: ["id"],
  components: {
    AdminTraining
  },
  computed: {
    ...mapState(["courses"]),
    course() {
      let f = this.courses.filter((o) => o.courseId == this.id);
      if (f.length > 0) return f[0];
      else return null;
    },
    trainings () {
      if (this.course === null) return [];
      return _.sortBy(this.course.trainings, "trainingDate")
    }
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