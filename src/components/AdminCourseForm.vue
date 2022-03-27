<template>
    <div class="card">
      <div class="card-content">
        <div class="card-title">
          {{ type == "edit" ? "Kurs bearbeiten" : "Kurs erstellen" }}
        </div>
        <div class="row">
          <div class="col s12">
            <div class="input-field">
              <input v-model="values.title" id="title" type="text" />
              <label for="title">Kursname</label>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col s12">
            <div class="input-field">
              <input v-model="values.titleShort" id="title-short" type="text" />
              <label for="title-short">Kurzbezeichnung</label>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col s6">
            <Datepicker v-model="values.dateBegin" label="Startdatum" />
          </div>
          <div class="col s6">
            <Datepicker v-model="values.dateEnd" label="Enddatum" />
          </div>
        </div>
        <div class="row">
          <div class="col s12">
            <Select label="Wochentag" :choices="weekdays" v-model="values.dayOfWeek"/>
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
import M from 'materialize-css'
import Datepicker from "@/components/Datepicker";
import Timepicker from "@/components/Timepicker";
import Select from '@/components/Select'
import dayjs from 'dayjs'
import _ from 'lodash'

export default {
  props: ["id"],
  components: {
    Datepicker,
    Timepicker,
    Select
  },
  data() {
    let weekdays = _.zipObject(
      _.range(1, 8),
      _.map(_.range(1, 8), o => dayjs().isoWeekday(o).format("dddd"))
    )

    return {
      values: {
        title: "",
        titleShort: "",
        dateBegin: "",
        dateEnd: "",
        timeBegin: "",
        timeEnd: "",
        comment: "",
        location: "",
      },
      weekdays: weekdays
    };
  },
  watch: {
    course: {
      handler(val) {
        if (!val) return;
        this.values = val;
        setTimeout(M.updateTextFields, 100);
      },
      immediate: true,
    },
  },
  computed: {
    ...mapState(["courses"]),
    type() {
      return !this.course ? "new" : "edit";
    },
    course() {
      let f = this.courses.filter((o) => o.courseId == this.id);
      if (f.length > 0) return f[0];
      else return null;
    },
  },
  methods: {
    ...mapActions(["saveCourse"]),
    async save() {
      let courseId = await this.saveCourse(this.values);
      if(courseId != -1)
        this.$router.push({ path: "/admin/course/" + courseId });
    },
    cancel() {
      if (this.type == "edit") {
        this.$router.push({ path: "/admin/course/" + this.course.courseId });
      }
      if (this.type == "new") {
        this.$router.push({ path: "/admin/" });
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