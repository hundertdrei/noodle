<template>
    <div class="card">
      <div class="card-content">
        <div class="card-title">
          {{ type == "edit" ? "Saison bearbeiten" : "Saison erstellen" }}
        </div>
        <div class="row">
          <div class="col s12">
            <div class="input-field">
              <input v-model="values.name" id="name" type="text" />
              <label for="title">Name</label>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col s12">
            <Datepicker v-model="values.date" label="Datum" />
          </div>
        </div>
      </div>
      <div class="card-action">
        <button
          class="btn waves-effect waves-light"
          type="submit"
          @click="save"
        >
          Speichern
        </button>
        <button
          class="btn waves-effect waves-light grey"
          type="submit"
          @click="cancel"
        >
          Abbrechen
        </button>
      </div>
    </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import Datepicker from "@/components/Datepicker";
import _ from 'lodash'
import M from "materialize-css";


export default {
  props: ["id"],
  components: {
    Datepicker
  },
  data() {
    return {
      values: {
        name: "",
        date: ""
      },
    };
  },
  watch: {
    season: {
      handler(val) {
        if (!val) return;
        this.values = val;
        setTimeout(M.updateTextFields, 100);
      },
      immediate: true,
    },
  },
  computed: {
    ...mapState(["seasons"]),
    type() {
      return !this.season ? "new" : "edit";
    },
    season() {
      let seasons = _.values(this.seasons)
      let f = seasons.filter((o) => o.seasonId == this.id);
      if (f.length > 0) return f[0];
      else return null;
    },
  },
  methods: {
    ...mapActions(["saveSeason"]),
    async save() {
      let seasonId = await this.saveSeason(this.values);

      this.$router.push({ path: "/admin/season/" + seasonId });
    },
    cancel() {
      if (this.type == "edit") {
        this.$router.push({ path: "/admin/season/" + this.season.seasonId });
      }
      if (this.type == "new") {
        this.$router.push({ path: "/admin/seasons" });
      }
    },
  },
};
</script>

<style scoped>
.card-action button + button {
  margin-left: 0.5em;
}
</style>