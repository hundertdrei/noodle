<template>
    <div class="card milestones">
        <div class="card-image">
            <router-link to="/admin/milestone/new" class="btn-floating halfway-fab waves-effect waves-light blue">
                <i class="material-icons">add</i>
            </router-link>
            <div class="new-milestone-date-container">
                <input type="text" class="datepicker" ref="new-milestone-date">
            </div>
        </div>
        <div class="card-content">
            <span class="card-title">Semestertermine</span>
            <ul class="collection">
                <li v-for="milestone in milestones" :key="milestone.date" class="collection-item">
                    <p><router-link :to="'/admin/milestone/' + milestone.date">{{ milestone.name }}</router-link></p>
                    <p>Datum: {{ milestone.date | dayjs("DD.MM.YYYY") }}</p>
                </li>
                <li v-if="milestones.length == 0" class="collection-item">
                    <i>Noch keine Semestertermine vorhanden</i>
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
            newMilestoneForm: null
        }
    },
    computed: {
        ...mapState(["milestones"])
    },
}
</script>

<style scoped>
.new-milestone-date-container input {
  display: none;
}
</style>