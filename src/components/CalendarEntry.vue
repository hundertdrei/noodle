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
    <div class="more-info" @click="showDetails" ref="more-info">
      <i class="material-icons">info_outline</i>
    </div>
    <div class="text-bold">
      <span class="training-date">{{ data.trainingDate | dayjs("dateshort") }}</span>&nbsp;
      <span class="training-title">{{ data.course.titleShort }}</span>
    </div>
    <div class="training-details" v-if="details">
      {{ data }}
    </div>
  </div>
</template>e

<script>
import { mapActions } from 'vuex';

export default {
  name: "CalendarEntry",
  props: ["data", "attend", "trainingId"],
  data() {
    return {
      details: false
    }
  },
  methods: {
      ...mapActions(["toggleAttendance"]),
      showDetails () {
        this.details = true;
      }
  },
  computed: {
    formatTime () {
      return function (x) { return this.$options.filters.timejs(x, "HH:mm") }
    }
  },
  mounted () {
    window.addEventListener("click", (e) => {
      if (!this.$refs["more-info"].contains(e.target)) {
        this.details = false;
      }
    })
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

.training-title {
  white-space: nowrap;
}

.more-info {
  float: right;
  display: infalseline;
}

.more-info i {
  font-size: 1.4em;
  color: var(--color-gray1);
}

.training-details {
  position: absolute;
  background: white;
  border: 1px black solid;
}
</style>