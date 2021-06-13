<template>
  <div class="admin">
    <h1>This is an admin page</h1>
    <button @click="logout">Logout</button>
  </div>
</template>

<script>
export default {
  methods: {
    logout () {
      this.$store.dispatch('logout');
    }
  }
}
</script>