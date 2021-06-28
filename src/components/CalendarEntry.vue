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
      {{ data.trainingDate | dayjs("D.M.") }} {{ data.course.titleShort }}
    </div>
    <div>
      {{ data.course.timeBegin | timejs("H:mm") }} -
      {{ data.course.timeEnd | timejs("H:mm") }}
    </div>
    <div>{{ data.course.location }}</div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: "CalendarEntry",
  props: ["data", "attend", "trainingId"],
  methods: {
      ...mapActions(["toggleAttendance"])
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