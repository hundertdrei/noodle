<template>
  <span>
    <span :class="{strike: showAlternative}">
        {{ formatTime(defaultObj.timeBegin) }} - {{ formatTime(defaultObj.timeEnd) }}
    </span>
    <span v-if="showAlternative">
        {{ formatTime(altObj.timeBegin ? altObj.timeBegin : defaultObj.timeBegin) }} - {{ formatTime(altObj.timeEnd ? altObj.timeEnd : defaultObj.timeEnd) }}
    </span>
  </span>
</template>

<script>
export default {
  name: "TrainingTimeRange",
  props: ["defaultObj", "altObj"],
  computed: {
    showAlternative () {
        return this.altObj && (this.altObj.timeBegin || this.altObj.timeEnd)
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
