<template>
  <div class="card">
    <div class="card-content">
      <table>
        <tr>
          <th v-for="(day, j) in calendarDays" :key="j">
            {{ day | weekdayName }}
          </th>
        </tr>
        <tr v-for="(week, i) in calendar" :key="i">
          <td v-for="(day, j) in calendarDays" :key="j">
            <CalendarEntry
              v-for="training in week[day]"
              :key="training.trainingId"
              :data="training"
              :attend="attend(training.trainingId)"
              :trainingId="training.trainingId"
            />
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import CalendarEntry from "@/components/CalendarEntry";

export default {
  name: "Calendar",
  components: {
    CalendarEntry,
  },
  computed: {
    ...mapGetters(["calendar", "calendarDays"]),
    ...mapState(["attendance"])
  },
  methods: {
    ...mapActions(["getTrainings"]),
    attend(trainingId) {
      let a = this.attendance.filter(
          (o) => (o.trainingId == trainingId)
      );

      if (a.length == 0) return null;
      return a[0].attend;
    },
  },
  created() {
    this.getTrainings();
  },
};
</script>

<style scoped>
td {
  padding: 0;
}
</style>