import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Admin from '../views/Admin.vue'
import Login from '../views/Login.vue'
import store from '@/store'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/admin',
    name: 'Admin',
    async beforeEnter (to, from, next) {
      await store.dispatch('initAuthentication')

      if (await store.dispatch('isAuthenticated')) next()
      else next("/login")
    },
    component: Admin
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    async beforeEnter (to, from, next) {
      await store.dispatch('initAuthentication')
      if (await store.dispatch('isAuthenticated')) next("/admin")
      else next()
    }
  },
  {
    path: '/callback',
    async beforeEnter (to, from, next) {
      await store.dispatch('initAuthentication')
      await store.dispatch('handleRedirectCallback');

      next('/admin')
    }
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
