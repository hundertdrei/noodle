<template>
  <div class="card">
    <div class="card-content">
      <div class="input-field">
        <i class="material-icons prefix">face</i>
        <input v-model="player" type="text" id="autocomplete-input" class="autocomplete"  ref="autocomplete"/>
        <label for="autocomplete-input">Spieler*in</label>
      </div>
    </div>
  </div>
</template>

<script>
import M from "materialize-css";
import { mapActions, mapState } from "vuex";

export default {
  data () {
    return {
      autocomplete: null,
      player: ''
    }
  },
  computed: {
    ...mapState(["players"]),
    choices () {
      let tuples = this.players.map(o => [o.name, ""])
      return Object.fromEntries(tuples)
    }
  },
  methods: {
    ...mapActions(["getPlayers", "setPlayer"]),
    updatePlayer () {
      let filtered = this.players.filter(o => o.name == this.player)
      if (filtered.length > 0) {
        this.setPlayer(filtered[0])
      } else {
        this.setPlayer({
          playerId: -1,
          name: this.player
        })
      }
    }
  },
  created() {
    this.getPlayers();
  },
  mounted() {
    var elems = this.$refs["autocomplete"];
    let instances = M.Autocomplete.init(elems, {
      data: this.choices,
      onAutocomplete: (value) => this.player = value
    });
    this.autocomplete = instances;
  },
  watch: {
    choices: function(val) {
      this.autocomplete.updateData(val);
    },
    player: function() {
      this.updatePlayer();
    }
  }
};
</script>