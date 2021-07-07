<template>
  <div class="card">
    <div class="card-content">
      <span class="card-title" style="font-size:1.250rem; line-height: 1.2em;">{{ data.course.title }}</span>
      <div class="text-bold">{{ data.trainingDate | dayjs('ddd, D.M YYYY') }}</div>
      <hr>
      <div>{{ data.course.location }}</div>
      <div>
        <span :class="{strike: data.timeBegin != data.courseTimeBegin}">{{ data.course.timeBegin | timejs('H:mm') }}</span>
        <span v-if="data.timeBegin != data.courseTimeBegin">{{ data.course.timeBegin | timejs('H:mm') }}</span>
         - 
        <span :class="{strike: data.timeEnd != data.coursetimeEnd}">{{ data.course.timeEnd | timejs('H:mm') }}</span>
        <span v-if="data.timeEnd != data.coursetimeEnd">{{ data.course.timeEnd | timejs('H:mm') }}</span>
      </div>
      <div>{{ data.course.comment }}</div>
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
  },
};
</script>

<style scoped>
.strike {
    text-decoration: line-through;

}
</style>