<template>
    <div>
        <Training v-for="training in nextTrainings" :data="training" :key="training.trainingId" />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

import Training from '@/components/Training.vue'

export default {
  name: 'NextTrainings',
  components: {
      Training
  },
  computed: {
    ...mapState(['nextTrainings'])
  },
  methods: {
    ...mapActions(['getNextTrainings'])
  },
  created () {
    this.getNextTrainings();
    window.addEventListener('focus', this.getNextTrainings);
  },
}
</script>
