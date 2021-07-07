<template>
  <div>
    <div class="row">
      <div class="col s12">
        <Datepicker v-model="values.trainingDate" label="Datum" />
      </div>
    </div>
    <div class="row">
      <div class="col s6">
        <Timepicker v-model="values.timeBegin" label="Startzeit" />
      </div>
      <div class="col s6">
        <Timepicker v-model="values.timeEnd" label="Endzeit" />
      </div>
    </div>
    <div class="row">
      <div class="col s12">
        <div class="input-field">
          <input v-model="values.location" id="location" type="text" />
          <label for="location">Ort</label>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col s12">
        <div class="input-field">
          <textarea
            v-model="values.comment"
            id="comment"
            class="materialize-textarea"
          />
          <label for="comment">Kommentar</label>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col s12">
        <button
          @click="addTrainingLocal"
          class="btn btn-small waves-effect waves-light"
          type="submit"
          name="action"
        >
          Speichern
        </button>
        <button
          @click="deleteTrainingLocal"
          class="btn btn-small waves-effect waves-light red"
          type="submit"
          name="action"
        >
          Löschen
        </button>
      </div>
    </div>
  </div>
</template>


<script>
import M from "materialize-css";
import Datepicker from "@/components/Datepicker";
import Timepicker from "@/components/Timepicker"
import _ from "lodash";
import { mapActions } from "vuex";

const event = new Event("input");

export default {
  name: "AdminTrainingForm",
  props: ["training"],
  components: {
    Datepicker,
    Timepicker
  },
  data() {
    return {
      values: _.cloneDeep(this.training),
    };
  },
  methods: {
    ...mapActions(["addTraining", "deleteTraining"]),
    async addTrainingLocal() {
      await this.addTraining(this.values);
      this.$emit("close");
    },
    async deleteTrainingLocal() {
      await this.deleteTraining(this.training.trainingId);
      this.$emit("close");
    },
  },
  mounted() {
    setTimeout(function () {
      let timepicker = document.querySelectorAll(".timepicker");
      M.Timepicker.init(timepicker, {
        format: "hh:MM",
        twelveHour: false,
        onCloseEnd: () => timepicker.forEach((o) => o.dispatchEvent(event)),
      });
    }, 100);
  },
};
</script>

<style scoped>
.toggle-form {
  cursor: pointer;
}

button + button {
  margin-left: 0.5em;
}
</style>>