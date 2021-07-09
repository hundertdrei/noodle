<template>
  <div class="card">
    <div class="card-content">
      <span class="card-title" style="font-size:1.250rem; line-height: 1.2em;">{{ data.course.title }}</span>
      <div class="text-bold">{{ data.trainingDate | dayjs('ddd, D.M YYYY') }}</div>
      <hr>
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
      <hr>
      <div class="green-text">
        <div class="text-bold">Ich komme ({{ attending.length }})</div>
        <div v-for="attendee in attending" :key="attendee.playerId">
          {{ attendee.player.name }}
        </div>
      </div>
      <div class="red-text">
        <div class="text-bold">Ich komme nicht ({{ notAttending.length }})</div>
        <div v-for="attendee in notAttending" :key="attendee.playerId">
          {{ attendee.player.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Training",
  props: ["data"],
  computed: {
    attending() {
      return this.data.attendees.filter((o) => o.attend === true);
    },
    notAttending() {
      return this.data.attendees.filter((o) => o.attend === false);
    },
    formatTime () {
      return function (x) { return this.$options.filters.timejs(x, "HH:mm") }
    }
  },
};
</script>

<style scoped>
.strike {
    text-decoration: line-through;

}
</style>