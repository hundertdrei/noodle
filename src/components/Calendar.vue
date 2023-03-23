<template>
  <div class="card">
    <div class="card-content">
      <div v-for="(calendarTable, i) in calendar" :key="i">
      <h6 v-if="calendarTable[0].seasonBucket != -1">
        {{ seasons[calendarTable[0].seasonBucket].name }}
      </h6>
      <table>
        <tr>
          <th class="calender-head" v-for="(day, j) in calendarDays(calendarTable)" :key="j" :colspan="day.numCourses" :style="{ width: cellsWidth(calendarTable) }">
            {{ day.day | weekdayName }}
            <div class="minor" v-if="day.common.titleShort">{{ day.common.titleShort }}</div>
            <div class="minor" v-if="day.common.time">
              <TrainingTimeRange :defaultObj="day.common.time" />
            </div>
            <div class="minor" v-if="day.common.location">{{ day.common.location }}</div>
          </th>
        </tr>
        <tr v-for="(week, i) in calendarTable" :key="i">
          <td v-for="(day, j) in calendarCourses(calendarTable, week)" :key="j">
            <CalendarEntry
              v-if="day"
              :data="day"
              :attend="attend(day.trainingId)"
              :trainingId="day.trainingId"
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

        dayObj.numCourses = courses.length;
      });
      return dayObjs;
    },
    calendarCourses (table, week) {
      let dayObjs = this.calendarDays(table);
      /* calendarDays produces a "week" array, with each entry representing a weekday that has courses.
       * A weekday can have multiple courses.
       *
       * For generating a row in the table we want to 'flatten' so we have an entry for each _course_.
       * But this also needs to be _complete_, ie if a course does not exist/is in the past we still
       * need to produce an entry, otherwise things will appear at the wrong place in the table.
       * We return 'null' entries if a course is not show.
       */

      // Adds 'common' member to a day object
      let addCommonToDay = (dayInWeek, common) => dayInWeek ? _.assign({common: common }, dayInWeek) : null;
      // Fills any missing courses with 'null'
      let fillUpCourses = (days, numCourses) => (days.length < numCourses ? _.concat(days, _.times(numCourses - days.length, _.constant(null))) : days );
      // Extracts courses in a specific week for a given day
      let coursesForDay = (weekDays, day) => fillUpCourses(_.get(weekDays, day.day, []), day.numCourses);
      // "Expand" & flatten week with days into courses
      let courses = _.flatten(_.map(dayObjs, day => _.map(coursesForDay(week.days, day), dayInWeek => addCommonToDay(dayInWeek, day.common))));
      return courses;
    },
    cellsWidth(table) {
      let days = this.calendarDays(table);
      return '' + (100 / days.length) + '%';
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