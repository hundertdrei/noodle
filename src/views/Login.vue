<template>
  <div class="container">
    <div class="card">
      <div class="card-content">
        <span class="card-title">Login</span>
        <button @click="login">Login with Auth0</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    login () {
      this.$store.dispatch('login');
    }
  }
}
</script>
