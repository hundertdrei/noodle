<template>
  <div class="container">
    <div class="card">
      <div class="card-content">
        <a @click="login" class="btn waves-effect waves-light">
          <i class="material-icons right">lock</i>
            Login with Auth0
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    login () {
      this.$store.dispatch('auth/login');
    }
  }
}
</script>

<style scoped>
.card-content {
  text-align: center;
}
</style>