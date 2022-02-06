<template>
    <div class="training-grid">
      <div class="full-width">
        <div class="title">Datum</div>
        <div class="value"><Datepicker v-model="values.trainingDate" /></div>
      </div>
      <div class="default">
        <div class="title">Startzeit</div>
        <div class="value" :class="{strike: overwrite.timeBegin}">{{ course.timeBegin | timejs('HH:mm')}}</div>
      </div>
      <div class="overwrite">
        <label>
          <input type="checkbox" class="filled-in" checked="checked" v-model="overwrite.timeBegin"/>
          <span>Überschreiben</span>
        </label>
      </div>
      <div class="form" v-if="overwrite.timeBegin">
        <Timepicker v-model="values.timeBegin" />
      </div>
      <div class="default">
        <div class="title">Endzeit</div>
        <div class="value" :class="{strike: overwrite.timeEnd}"> {{ course.timeEnd | timejs('HH:mm')}}</div>
      </div>
      <div class="overwrite">
        <label>
          <input type="checkbox" class="filled-in" checked="checked" v-model="overwrite.timeEnd"/>
          <span>Überschreiben</span>
        </label>
      </div>
      <div class="form" v-if="overwrite.timeEnd">
        <Timepicker v-model="values.timeEnd" />
      </div>
      <div class="default">
        <div class="title">Ort</div>
        <div class="value" :class="{strike: overwrite.location}">{{ course.location }}</div>
      </div>
      <div class="overwrite">
        <label>
          <input type="checkbox" class="filled-in" checked="checked" v-model="overwrite.location"/>
          <span>Überschreiben</span>
        </label>
      </div>
      <div class="form" v-if="overwrite.location">
        <div class="input-field">
          <input v-model="values.location" id="location" type="text" />
        </div>
      </div>
      <div class="default">
        <div class="title">Kommentar</div>
        <div class="value" :class="{strike: overwrite.comment}">{{ course.comment }}</div>
      </div>
      <div class="overwrite">
        <label>
          <input type="checkbox" class="filled-in" checked="checked" v-model="overwrite.comment"/>
          <span>Überschreiben</span>
        </label>
      </div>
      <div class="form" v-if="overwrite.comment">
        <div class="input-field">
          <textarea
            v-model="values.comment"
            id="comment"
            class="materialize-textarea"
          />
        </div>
      </div>
      <div class="full-width">
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
</template>


<script>
import Datepicker from "@/components/Datepicker";
import Timepicker from "@/components/Timepicker"
import _ from "lodash";
import { mapActions } from "vuex";

export default {
  name: "AdminTrainingForm",
  props: ["training", "course"],
  components: {
    Datepicker,
    Timepicker
  },
  data() {
    return {
      values: _.cloneDeep(this.training),
      overwrite: _.mapValues(this.training, o => o !== null)
    };
  },
  methods: {
    ...mapActions(["addTraining", "deleteTraining"]),
    async addTrainingLocal() {
      let values = _.cloneDeep(this.values)

      for (let k in this.overwrite) {
        if (!this.overwrite[k]) {
          values[k] = null;
        }
      }

      await this.addTraining(values);
      this.$emit("close");
    },
    async deleteTrainingLocal() {
      let succeeded = await this.deleteTraining(this.training.trainingId);
      if(succeeded)
        this.$emit("close");
    },
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

.training-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
}

.default {
  grid-column: 1;
}

.overwrite {
  grid-column: 2;
}

.form {
  grid-column: 3;
}

.form .input-field,
.full-width .input-field {
  margin: 0;
}

.full-width {
  grid-column-start: 1;
  grid-column-end: 4;
}

.default {
  margin-bottom: 1em;
}

.default .title {
  font-weight: bold;
}

.default .value.strike {
  text-decoration: line-through;
}

.full-width {
  margin-top: 1em;
}

.full-width .title {
  font-weight: bold;
}

.full-width .value {
  text-decoration: line-through;
}
</style>