<template>
    <div class="card seasons">
        <div class="card-image">
            <router-link to="/admin/season/new" class="btn-floating halfway-fab waves-effect waves-light blue">
                <i class="material-icons">add</i>
            </router-link>
            <div class="new-season-date-container">
                <input type="text" class="datepicker" ref="new-season-date">
            </div>
        </div>
        <div class="card-content">
            <span class="card-title">Saisons</span>
            <ul class="collection">
                <li v-for="season in seasons" :key="season.seasonId" class="collection-item">
                    <p><router-link :to="'/admin/season/' + season.seasonId">{{ season.name }}</router-link></p>
                    <p>Start: {{ season.date | dayjs("DD.MM.YYYY") }}</p>
                </li>
                <li v-if="seasons.length == 0" class="collection-item">
                    <i>Noch keine Saisons vorhanden</i>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    data () {
        return {
            newSeasonForm: null
        }
    },
    computed: {
        ...mapState(["seasons"])
    },
}
</script>

<style scoped>
.new-season-date-container input {
  display: none;
}
</style>