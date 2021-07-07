<template>
  <div class="input-field">
    <select
      :id="id"
      class="select"
      v-bind:value="value"
      v-on:change="$emit('input', $event.target.value)"
      ref="select"
    >
      <option v-for="(lab, key) in choices" :key="key" :value="key" :selected="value == key">
        {{ lab }}
      </option>
    </select>
    <label :for="id">{{ label }}</label>
  </div>
</template>

<script>
import M from 'materialize-css'

export default {
  props: ["label", "value", "choices"],
  data() {
    return {
      id: "select-" + Math.random().toString(32).substring(2),
    };
  },
  mounted () {
    setTimeout(() => {
        let select = this.$refs["select"];
        M.FormSelect.init(select);
    }, 100)
  },
}
</script>
