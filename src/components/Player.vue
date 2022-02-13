<template>
  <div>
    <div class="card">
      <div class="card-content">
        <div class="input-field input-name">
          <i class="material-icons prefix">face</i>
          <input
            v-model="playerName"
            type="text"
            id="autocomplete-input"
            class="autocomplete"
            ref="autocomplete"
            autocomplete="off"
          />
          <label for="autocomplete-input">Spieler*in</label>
        </div>
        <div class="buttons" v-if="showButtons">
          <a class="modal-trigger" href="#modal1"><i class="material-icons edit">edit</i></a>
          <i class="material-icons delete" @click="deletePlayerLocal">delete</i>
        </div>
      </div>
    </div>
    <div id="modal1" ref="edit" class="modal">
      <div class="modal-content">
        <h5>Name ändern</h5>
        <div class="input-field">
          <input id="new-player-name" v-model="newPlayerName" type="text" class="validate">
          <label for="new-player-name" class="active">Spieler*in</label>
        </div>
      </div>
      <div class="modal-footer">
        <a href="#!" @click="saveNewName" class="btn-small waves-effect waves-light"
          >Speichern</a
        >
        <a href="#!" class="btn-small waves-effect waves-light grey modal-close"
          >Abbrechen</a
        >
      </div>
    </div>
  </div>
</template>

<script>
import M from "materialize-css";
import { mapActions, mapState } from "vuex";

export default {
  data() {
    return {
      autocomplete: null,
      playerName: "",
      modal: null,
      newPlayerName: ""
    };
  },
  computed: {
    ...mapState(["players", "player"]),
    choices() {
      let tuples = this.players.map((o) => [o.name, ""]);
      return Object.fromEntries(tuples);
    },
    showButtons () {
      return this.localPlayer.playerId != -1
    },
    localPlayer () {
      let filtered = this.players.filter((o) => o.name == this.playerName);
      if (filtered.length > 0) {
        return filtered[0];
      } else {
        return {
          playerId: -1,
          name: this.playerName,
        }
      }
    }
  },
  methods: {
    ...mapActions(["getPlayers", "setPlayer", "savePlayer", "deletePlayer"]),
    updatePlayer() {
      this.setPlayer(this.localPlayer);
    },
    async saveNewName () {
      if (this.newPlayerName.trim() == "") {
        alert("Spieler*innenname darf nicht leer sein")
        return;
      }

      await this.savePlayer({playerId: this.localPlayer.playerId, name: this.newPlayerName})

      this.modal.close();
      this.playerName = this.newPlayerName;
    },
    deletePlayerLocal () {
      if (!confirm("Spielerin inkl. allen Einträgen löschen?")) return;

      this.deletePlayer(this.localPlayer.playerId)

      this.playerName = "";
    }
  },
  created() {
    this.getPlayers();
  },
  mounted() {
    var elems = this.$refs["autocomplete"];
    const event = new Event("input");
    let instances = M.Autocomplete.init(elems, {
      data: this.choices,
      onAutocomplete: () => elems.dispatchEvent(event),
    });
    this.autocomplete = instances;

    let modal = this.$refs["edit"];
    this.modal = M.Modal.init(modal, {
      onOpenStart: () => this.newPlayerName = this.playerName
    });

    if (localStorage.playerName) {
      this.playerName = localStorage.playerName;
    }
  },
  watch: {
    choices: function (val) {
      this.autocomplete.updateData(val);
    },
    localPlayer: function () {
      this.updatePlayer();
    },
    playerName: function (newName) {
      localStorage.playerName = newName;
    },
  },
};
</script>

<style scoped>
.card-content {
  display: flex;
  align-items: center;
}

.card-content .input-name {
  flex-grow: 1;
}

.card-content .buttons i {
  cursor: pointer;
  color: rgba(0, 0, 0, 0.87);
}

.card-content .buttons i.edit:hover {
  color: green;
}

.card-content .buttons i.delete:hover {
  color: red;
}

.modal-footer a {
  margin-right: 0.5em !important;
}

.modal-content .input-field {
  padding-bottom: 0;
  margin-top: 2em;
}
</style>