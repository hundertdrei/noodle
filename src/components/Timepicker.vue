<template>
  <div class="input-field">
    <input
      v-bind:value="value"
      v-on:input="$emit('input', $event.target.value)"
      :id="id"
      type="text"
      ref="input"
    />
    <label :for="id" class="active">{{ label }}</label>
  </div>
</template>

<script>
import M from "materialize-css";

const event = new Event("input");

export default {
  props: ["label", "value"],
  data() {
    return {
      id: "time-" + Math.random().toString(32).substring(2),
      picker: null,
    };
  },
  mounted() {
    let input = this.$refs["input"];

    this.picker = M.Timepicker.init(input, {
      format: "hh:MM",
      twelveHour: false,
      onCloseEnd: () => input.dispatchEvent(event),
    });
  },
};
</script>