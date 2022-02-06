<template>
  <div class="container">
    <div class="card" v-if="errorMessage">
      <div class="card-content error-content">
          <div class="error-title">Fehler</div>
          <div>{{ errorMessage }}</div>
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
  props: ["errorMessage"],
  methods: {
    login () {
      this.$store.dispatch('auth/login');
    }
  }
}
</script>

<style scoped lang="scss">
@import "~materialize-css";

.card-content {
  text-align: center;
}
.error-content {
  @extend .red, .lighten-4;
}
.error-title {
  font-weight: bold;
}

</style>