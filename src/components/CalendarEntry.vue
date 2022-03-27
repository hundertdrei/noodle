<template>
  <div
    class="calendar-entry"
    :class="{
      green: attend === true,
      red: attend === false,
      'white-text': attend !== null,
    }"
    @click="toggleAttendance({trainingId: trainingId, old: attend})"
  >
    <div class="text-bold">
      {{ data.trainingDate | dayjs("dateshort") }} <span v-if="!common.titleShort || data.titleShort">{{ data.course.titleShort }}</span>
    </div>
    <div v-if="!common.time || data.timeBegin || data.timeEnd">
        <TrainingTimeRange :defaultObj="data.course" :altObj="data" />
    </div>
    <div v-if="!common.location || data.location">
        <Alt :x="data.course.location" :y="data.location"/>
    </div>
  </div>
</template>

<script>
import TrainingTimeRange from "@/components/TrainingTimeRange"
import { mapActions } from 'vuex';

export default {
  name: "CalendarEntry",
  props: ["data", "attend", "trainingId", "common"],
  components: {
    TrainingTimeRange
  },
  methods: {
      ...mapActions(["toggleAttendance"])
  },
  computed: {
    formatTime () {
      return function (x) { return this.$options.filters.timejs(x, "HH:mm") }
    }
  }
};
</script>

<style scoped>
.calendar-entry {
  padding: 0.5em 1em;
  cursor: pointer;
}

.calendar-entry:hover {
  background-color: #f5f5f5 !important;
}

.calendar-entry.green:hover {
  background-color: #2e7d32 !important;
}

.calendar-entry.red:hover {
  background-color: #d32f2f !important;
}
</style>