<template>
  <div class="card">
    <div class="card-content">
      <div v-for="(calendarTable, i) in calendar" :key="i">
      <h6 v-if="calendarTable[0].weekBucket != -1">
        {{ milestones[calendarTable[0].weekBucket].name }}
      </h6>
      <table>
        <tr>
          <th v-for="(day, j) in calendarDays(calendarTable)" :key="j">
            {{ day | weekdayName }}
          </th>
        </tr>
        <tr v-for="(week, i) in calendarTable" :key="i">
          <td v-for="(day, j) in calendarDays(calendarTable)" :key="j">
            <CalendarEntry
              v-for="training in week.days[day]"
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
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from "vuex";
import CalendarEntry from "@/components/CalendarEntry";
import _ from "lodash"
import dayjs from "dayjs"

export default {
  name: "Calendar",
  components: {
    CalendarEntry,
  },
  computed: {
    ...mapGetters(["calendar"]),
    ...mapState(["attendance", "milestones"])
  },
  methods: {
    ...mapActions(["getTrainings", "getMilestones"]),
    attend(trainingId) {
      let a = this.attendance.filter(
          (o) => (o.trainingId == trainingId)
      );

      if (a.length == 0) return null;
      return a[0].attend;
    },
    calendarDays (table) {
      let days = _.map(table, week => _.map(_.values(week.days), day => _.map(day, o => dayjs(o.trainingDate).isoWeekday())));
      days = _.flattenDeep(days)
      return _.uniq(days).sort();
    },
  },
  created() {
    this.getTrainings();
    this.getMilestones();
  },
};
</script>

<style scoped>
th {
  padding: 0.5em 1em
}

td {
  padding: 0;
  vertical-align: top;
}

table {
  margin-bottom: 3em;
}
</style>