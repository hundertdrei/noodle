<template>
  <div
    class="calendar-entry"
    @mouseenter="showDetails"
    @mouseleave="hideDetails"
    :class="{
      green: attend === true,
      red: attend === false,
      'white-text': attend !== null,
    }"
    @click="toggleAttendanceLocal"
  >
    <div class="more-info" @click="showDetails" ref="more-info" :class="{'red-text': attend !== false && this.changed, 'black-text': attend === false && this.changed}">
      <i class="material-icons">info_outline</i>
    </div>
    <div class="text-bold">
      <span class="training-date">{{ data.trainingDate | dayjs("dateshort") }}</span>&nbsp;
      <span class="training-title">{{ data.course.titleShort }}</span>
    </div>
    <div class="training-details black-text" v-if="details">
     <div>
       <b>{{ data.course.title }}</b>
     </div>
      <div>
        <Alt :x="data.course.location" :y="data.location"/>
      </div>
      <div>
        <Alt :x="data.course.timeBegin" :y="data.timeBegin" :format="formatTime"/>
         - 
        <Alt :x="data.course.timeEnd" :y="data.timeEnd" :format="formatTime"/>
      </div>
      <div>
        <Alt :x="data.course.comment" :y="data.comment"/>
      </div>
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
      },
      hideDetails () {
        this.details = false;
      },
      toggleAttendanceLocal(e) {
        let moreInfo = this.$refs["more-info"];
        if (!moreInfo.contains(e.target)) {
          this.toggleAttendance({trainingId: this.trainingId, old: this.attend})
        }
      }
  },
  computed: {
    formatTime () {
      return function (x) { return this.$options.filters.timejs(x, "HH:mm") }
    },
    changed () {
      return this.data.location !== null ||
         this.data.timeBegin !== null ||
         this.data.timeEnd !== null ||
         this.data.comment !== undefined;
    }
  },
  mounted () {
    let moreInfo = this.$refs["more-info"]
    window.addEventListener("click", (e) => {
      if (!moreInfo.contains(e.target)) {
        this.hideDetails()
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
  color: var(--color-gray1);
}

.more-info i {
  font-size: 1.4em;
  font-weight: bold;
}


.training-details {
  padding: 0.5em 1em;
  position: absolute;
  width: 40%;
  background: white;
  border: 1px var(--color-gray1) solid;
  z-index: 100;
}
</style>