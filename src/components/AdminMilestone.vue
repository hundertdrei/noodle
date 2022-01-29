<template>
    <div class="card" v-if="milestone">
        <div class="card-content">
            <span class="card-title">{{ milestone.name }}</span>
            <div>Datum: {{ milestone.date | dayjs('DD.MM.YYYY' )}}</div>
        </div>
        <div class="card-action">
            <router-link class="green-text" :to="`/admin/milestone/${milestone.date}/edit`">Bearbeiten</router-link>
            <a class="red-text" @click="deleteMilestoneLocal(milestone.date)">Löschen</a>
        </div>
    </div>
</template>


<script>
import { mapState, mapActions } from 'vuex'
import _ from 'lodash'

export default {
  props: ["date"],
  data() {
    return {
      showForm: false
    };
  },
  computed: {
    ...mapState(["milestones"]),
    milestone() {
      let milestones = _.values(this.milestones)
      let f = milestones.filter((o) => o.date == this.date);
      if (f.length > 0) return f[0];
      else return null;
    },
  },
  methods: {
      ...mapActions(["deleteMilestone"]),
    async deleteMilestoneLocal (date) {
      if (!confirm('Soll dieser Semestertermin wirklich gelöscht werden?')) return;
      
      await this.deleteMilestone(date);

      this.$router.push('/admin/milestones')
    },
  },
};
</script>

<style scoped>
.toggle-form {
    cursor: pointer;
}
</style>>