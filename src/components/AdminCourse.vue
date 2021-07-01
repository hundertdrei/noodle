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
        <a href="#" class="red-text">Löschen</a>
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