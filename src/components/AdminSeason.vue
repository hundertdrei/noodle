<template>
    <div class="card" v-if="season">
        <div class="card-content">
            <span class="card-title">{{ season.name }}</span>
            <div>Start: {{ season.date | dayjs('DD.MM.YYYY' )}}</div>
        </div>
        <div class="card-action">
            <router-link class="green-text" :to="`/admin/season/${season.seasonId}/edit`">Bearbeiten</router-link>
            <a class="red-text" @click="deleteSeasonLocal(season.seasonId)">Löschen</a>
        </div>
    </div>
</template>


<script>
import { mapState, mapActions } from 'vuex'
import _ from 'lodash'

export default {
  props: ["id"],
  data() {
    return {
      showForm: false
    };
  },
  computed: {
    ...mapState(["seasons"]),
    season() {
      let seasons = _.values(this.seasons)
      let f = seasons.filter((o) => o.seasonId == this.id);
      if (f.length > 0) return f[0];
      else return null;
    },
  },
  methods: {
      ...mapActions(["deleteSeason"]),
    async deleteSeasonLocal (date) {
      if (!confirm('Soll diese Saison wirklich gelöscht werden?')) return;
      
      await this.deleteSeason(date);

      this.$router.push('/admin/seasons')
    },
  },
};
</script>

<style scoped>
.toggle-form {
    cursor: pointer;
}
</style>>