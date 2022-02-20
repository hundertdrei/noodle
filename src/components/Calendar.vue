<template>
  <div class="card">
    <div class="card-content">
      <div v-for="(calendarTable, i) in calendar" :key="i">
      <h6 v-if="calendarTable[0].weekBucket != -1">
        {{ seasons[calendarTable[0].weekBucket].name }}
      </h6>
      <table>
        <tr>
          <th class="calender-head" v-for="(day, j) in calendarDays(calendarTable)" :key="j">
            {{ day.day | weekdayName }}
            <div class="minor" v-if="day.common.titleShort">{{ day.common.titleShort }}</div>
            <div class="minor" v-if="day.common.time">
              <TrainingTimeRange :defaultObj="day.common.time" />
            </div>
            <div class="minor" v-if="day.common.location">{{ day.common.location }}</div>
          </th>
        </tr>
        <tr v-for="(week, i) in calendarTable" :key="i">
          <td v-for="(day, j) in calendarDays(calendarTable)" :key="j">
            <CalendarEntry
              v-for="training in week.days[day.day]"
              :key="training.trainingId"
              :data="training"
              :attend="attend(training.trainingId)"
              :trainingId="training.trainingId"
              :common="day.common"
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
import TrainingTimeRange from "@/components/TrainingTimeRange"
import _ from "lodash"
import dayjs from "dayjs"

export default {
  name: "Calendar",
  components: {
    CalendarEntry,
    TrainingTimeRange,
  },
  computed: {
    ...mapGetters(["calendar"]),
    ...mapState(["attendance", "seasons"])
  },
  methods: {
    ...mapActions(["getTrainings", "getSeasons"]),
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
      let dayObjs = _.map(_.uniq(days).sort(), day => ({"day": day}));

      dayObjs.forEach(dayObj => {
        /* A field is "common" to a day if all _courses_ have the same value.
           It doesn't matter if some individual training as a different value.
           (In that case the "correction" should still appear inline.) */

        // Obtain the courses on the given day
        let courses = _.map(_.filter(_.map(table, week => week.days[dayObj.day]), days => days !== undefined)[0], training => training.course);

        // Return the "common" value of 'prop' for in the courses days, or null if not common
        let resolveCommon = function(prop) {
          let refPropVal = courses[0][prop];

          // Check if all courses have the same value for 'prop' by comparing against the value of the first course
          let isCommon = _.reduce(courses, (result, value) => result && value[prop] == refPropVal, true);

          return isCommon ? refPropVal : null;
        };

        dayObj.common = Object();
        dayObj.common.titleShort = resolveCommon('titleShort');
        dayObj.common.location = resolveCommon('location');
        let commonTimeBegin = resolveCommon('timeBegin');
        let commonTimeEnd = resolveCommon('timeEnd');
        dayObj.common.time = null;
        if(commonTimeBegin && commonTimeEnd) {
          dayObj.common.time = { timeBegin: commonTimeBegin, timeEnd: commonTimeEnd };
        }
      });
      return dayObjs;
    },
  },
  created() {
    this.getTrainings();
    this.getSeasons();
  },
};
</script>

<style scoped lang="scss">
th.calender-head {
  padding: 0.5em 1em;
  vertical-align: top;

  .minor {
    font-weight: normal;
  }
}

td {
  padding: 0;
  vertical-align: top;
}

table {
  margin-bottom: 3em;
}
</style>