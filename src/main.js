import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import dayjs from 'dayjs'
import Alt from '@/components/Alt'

Vue.component('Alt', Alt)

Vue.config.productionTip = false

Vue.filter('dayjs', (x, format) => {
  return dayjs(x, "YYYY-MM-DD").format(format);
})

Vue.filter('timejs', (x, format) => {
  return dayjs("2020-01-01 " + x, "YYYY-MM-DD HH:mm").format(format);
})

Vue.filter('weekdayName', (x) => {
  if (x === undefined) return x;
  return dayjs().isoWeekday(x).format("dddd")
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
