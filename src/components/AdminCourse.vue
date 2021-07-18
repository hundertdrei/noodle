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
    <div class="card trainings">
      <div class="card-image">
        <a @click="addTrainingDialog" class="btn-floating halfway-fab waves-effect waves-light green">
          <i class="material-icons">add</i>
        </a>
        <div class="new-training-date-container">
         <input type="text" class="datepicker" ref="new-training-date">
         </div>
      </div>
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
import M from 'materialize-css'
import dayjs from 'dayjs'

export default {
  props: ["id"],
  data () {
    return {
      newTrainingForm: null
    }
  },
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
    ...mapActions(['fillTrainings', 'deleteCourse', "addTraining"]),
    async deleteCourseLocal (courseId) {
      if (!confirm('Soll der Kurs inkl. aller Trainingstermine wirklich gelöscht werden?')) return;
      
      await this.deleteCourse(courseId);

      this.$router.push('/admin')
    },
    addTrainingDialog() {
      if (this.newTrainingForm === null) {
        this.newTrainingForm = M.Datepicker.init(
          this.$refs['new-training-date'],
          {
            onClose: () => {
              let dateFormatted = dayjs(this.newTrainingForm.date).format("YYYY-MM-DD");
              this.addTraining({courseId: this.id, trainingDate: dateFormatted})
            }
          })
      }
      this.newTrainingForm.open();
    }
  },
};
</script>

<style scoped>
.trainings {
  margin-top: 4em;
}

.new-training-date-container input {
  display: none;
}
</style>