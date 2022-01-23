<template>
  <div class="container">
    <div class="card" v-if="error_message">
      <div class="card-content error-content">
          <div class="error-title">Fehler</div>
          <div>{{ error_message }}</div>
      </div>
    </div>
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
  props: ["error_message"],
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
.error-content {
  background: #ffe0e0;
}
.error-title {
  font-weight: bold;
}

</style>