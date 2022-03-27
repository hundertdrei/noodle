<template>
  <div class="card">
    <div class="card-content">
      <span class="card-title" style="font-size:1.250rem; line-height: 1.2em;">{{ data.course.title }}</span>
      <div class="text-bold">{{ data.trainingDate | dayjs('dd, LL') }}</div>
      <hr>
      <div>
        <Alt :x="data.course.location" :y="data.location"/>
      </div>
      <div>
        <TrainingTimeRange :defaultObj="data.course" :altObj="data" />
      </div>
      <div>
        <Alt :x="data.course.comment" :y="data.comment"/>
      </div>
      <hr>
      <div class="green-text">
        <div class="text-bold title-attending" @click="toggleCollapseAttending">
          Ich komme ({{ attending.length }})
          <span class="material-icons" v-if="collapseAttending">arrow_drop_down</span>
          <span class="material-icons" v-else>arrow_drop_up</span>
        </div>
        <div v-if="!collapseAttending">
        <div v-for="attendee in attending" :key="attendee.playerId">
          {{ attendee.player.name }}
        </div>
        </div>
      </div>
      <div class="red-text">
        <div class="text-bold title-attending" :class="{collapsed: collapseNotAttending}" @click="toggleCollapseNotAttending">
          Ich komme nicht ({{ notAttending.length }})          
          <span class="material-icons" v-if="collapseNotAttending">arrow_drop_down</span>
          <span class="material-icons" v-else>arrow_drop_up</span>
        </div>
        <div v-if="!collapseNotAttending">
        <div v-for="attendee in notAttending" :key="attendee.playerId">
          {{ attendee.player.name }}
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import TrainingTimeRange from "@/components/TrainingTimeRange"

export default {
  name: "Training",
  props: ["data"],
  components: {
    TrainingTimeRange
  },
  data () {
    return {
      collapseAttending: false,
      collapseNotAttending: true
    }
  },
  methods: {
    toggleCollapseAttending() {
      this.collapseAttending = !this.collapseAttending;
      this.$store.dispatch('getNextTrainings');
    },
    toggleCollapseNotAttending() {
      this.collapseNotAttending = !this.collapseNotAttending;
      this.$store.dispatch('getNextTrainings');
    }
  },
  computed: {
    attendees () {
      return _.sortBy(this.data.attendees, o => o.player.name.toLowerCase())
    },
    attending() {
      return this.attendees.filter((o) => o.attend === true);
    },
    notAttending() {
      return this.attendees.filter((o) => o.attend === false);
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

.title-attending {
  cursor: pointer;
  white-space: nowrap;
}

.title-attending .material-icons {
  vertical-align: bottom;
}
</style>