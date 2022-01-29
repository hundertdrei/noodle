<template>
    <div class="card">
      <div class="card-content">
        <div class="card-title">
          {{ type == "edit" ? "Semestertermin bearbeiten" : "Semestertermin erstellen" }}
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

export default {
  props: ["date"],
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
    // course: {
    //   handler(val) {
    //     if (!val) return;
    //     this.values = val;
    //     setTimeout(M.updateTextFields, 100);
    //   },
    //   immediate: true,
    // },
  },
  computed: {
    ...mapState(["milestones"]),
    type() {
      return !this.milestone ? "new" : "edit";
    },
    milestone() {
      let milestones = _.values(this.milestones)
      let f = milestones.filter((o) => o.date == this.date);
      if (f.length > 0) return f[0];
      else return null;
    },
  },
  methods: {
    ...mapActions(["saveMilestone"]),
    async save() {
      let date = await this.saveMilestone(this.values);

      this.$router.push({ path: "/admin/milestone/" + date });
    },
    cancel() {
      if (this.type == "edit") {
        this.$router.push({ path: "/admin/milestone/" + this.milestone.date });
      }
      if (this.type == "new") {
        this.$router.push({ path: "/admin/milestones" });
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