<template>
  <div class="container">
    <div class="card">
      <div class="card-content">
        <div class="card-title">{{ type == 'edit' ? 'Kurs bearbeiten' : 'Kurs erstellen' }}</div>
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
            <div class="input-field">
              <input
                v-model="values.dateBegin"
                id="date-begin"
                type="text"
                class="datepicker"
              />
              <label for="date-begin">Startdatum</label>
            </div>
          </div>
          <div class="col s6">
            <div class="input-field">
              <input
                v-model="values.dateEnd"
                id="date-end"
                type="text"
                class="datepicker"
              />
              <label for="date-end">Enddatum</label>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col s12">
            <select id="day-of-week" class="select" v-model="values.dayOfWeek">
              <option v-for="d in 7" :key="d" :value="d">
                {{ d | weekdayName }}
              </option>
            </select>
            <label for="day-of-week">Wochentag</label>
          </div>
        </div>
        <div class="row">
          <div class="col s6">
            <div class="input-field">
              <input
                v-model="values.timeBegin"
                id="time-begin"
                type="text"
                class="timepicker"
              />
              <label for="time-begin">Startzeit</label>
            </div>
          </div>
          <div class="col s6">
            <div class="input-field">
              <input
                v-model="values.timeEnd"
                id="time-end"
                type="text"
                class="timepicker"
              />
              <label for="time-end">Endzeit</label>
            </div>
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
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import M from "materialize-css";

export default {
  props: ["id"],
  data() {
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
    type () {
        return !this.course ? 'new' : 'edit';
    },
    course() {
      let f = this.courses.filter((o) => o.courseId == this.id);
      if (f.length > 0) return f[0];
      else return null;
    },
  },
  mounted() {
      setTimeout(function() {
        let datepicker = document.querySelectorAll(".datepicker");
        M.Datepicker.init(datepicker, { format: "yyyy-mm-dd" });

        let timepicker = document.querySelectorAll(".timepicker");
        M.Timepicker.init(timepicker, { format: "hh:MM", twelveHour: false });

        let select = document.querySelectorAll(".select");
        M.FormSelect.init(select);
      }, 100);
  },
  methods: {
    ...mapActions(["saveCourse"]),
    async save() {
      let courseId = await this.saveCourse(this.values);

      this.$router.push({ path: "/admin/course/" + courseId });
    },
    cancel() {
        if (this.type == 'edit') {
            this.$router.push({ path: "/admin/course/" + this.course.courseId });
        }
        if (this.type == 'new') {
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