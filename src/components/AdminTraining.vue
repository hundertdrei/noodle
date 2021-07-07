<template>
  <li class="collection-item">
    {{ training.trainingDate | dayjs("dddd, DD.MM.YYYY") }}
    <span class="secondary-content">
      <i class="material-icons toggle-form" @click="toggleForm">more_vert</i>
    </span>
    <AdminTrainingForm v-if="showForm" :training="training" @close="toggleForm"/>
  </li>
</template>


<script>
import AdminTrainingForm from '@/components/AdminTrainingForm'

export default {
  name: "AdminTraining",
  components: {
    AdminTrainingForm
  },
  props: ["training"],
  data() {
    return {
      showForm: false
    };
  },
  methods: {
    toggleForm() {
      this.showForm = !this.showForm;
    },
  },
};
</script>

<style scoped>
.toggle-form {
    cursor: pointer;
}
</style>>