<template>
  <div class="container">
    <div class="row">
      <div class="col s12 m4">
        <NextTrainings />
      </div>
      <div class="col s12 m8">
        <Player />
        <Calendar />
      </div>
    </div>
  </div>
</template>

<script>
import NextTrainings from "@/components/NextTrainings"
import Player from "@/components/Player"
import Calendar from "@/components/Calendar"

export default {
  name: "Home",
  components: {
    NextTrainings,
    Player,
    Calendar
  },
};
</script>
