<template>
  <span>
    <Alt :x="defaultObj.timeBegin" :y="altObj ? altObj.timeBegin : null" :format="formatTime"/>
      - 
    <Alt :x="defaultObj.timeEnd" :y="altObj ? altObj.timeEnd : null" :format="formatTime"/>
  </span>
</template>

<script>
export default {
  name: "TrainingTimeRange",
  props: ["defaultObj", "altObj"],
  computed: {
    formatTime () {
      return function (x) { return this.$options.filters.timejs(x, "HH:mm") }
    }
  },
};
</script>
