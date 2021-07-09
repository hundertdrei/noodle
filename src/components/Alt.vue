<template>
  <span>
      <span :class="{strike: showAlternative}">
          {{ format(x) }}
      </span>
      <span v-if="showAlternative">
          {{ format(y) }}
      </span>
  </span>
</template>

<script>
export default {
  props: {
    format: {
      type: Function,
      default: (x) => x,
    },
    x: String,
    y: String
  },
  computed: {
      showAlternative () {
          return this.y !== null
      }
  }
};
</script>

<style scoped>
.strike {
    text-decoration: line-through;
}
</style>