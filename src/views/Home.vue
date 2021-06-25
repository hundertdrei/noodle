<template>
  <div class="home">
    <div v-for="player in players" :key="player.playerId">
      {{ player.playerName }}
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  name: 'Home',
  computed: {
    ...mapState(['players'])
  },
  methods: {
    ...mapActions(['getPlayers'])
  },
  created () {
    this.getPlayers()
  }
}
</script>
