import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/views/Home.vue'
import Admin from '@/views/Admin.vue'

import AdminCourses from '@/components/AdminCourses.vue'
import AdminCourse from '@/components/AdminCourse.vue'
import AdminCourseForm from '@/components/AdminCourseForm.vue'

import AdminSeasons from '@/components/AdminSeasons.vue'
import AdminSeason from '@/components/AdminSeason.vue'
import AdminSeasonForm from '@/components/AdminSeasonForm.vue'

import Login from '@/views/Login.vue'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    async beforeEnter (to, from, next) {
      await store.dispatch('auth/initAuthentication')
      await store.dispatch('auth/isAuthenticated');
      next();
    }
  },
  {
    path: '/admin',
    async beforeEnter (to, from, next) {
      await store.dispatch('auth/initAuthentication')

      if (await store.dispatch('auth/isAuthenticated')) next()
      else next("/login")
    },
    component: Admin,
    children: [
      {
        path: 'courses',
        component: AdminCourses
      },
      {
        path: 'course/new',
        component: AdminCourseForm
      },
      {
        path: 'course/:id',
        component: AdminCourse,
        props: true
      },
      {
        path: 'course/:id/edit',
        component: AdminCourseForm,
        props: true
      },
      { 
        path: 'seasons',
        component: AdminSeasons
      },
      {
        path: 'season/new',
        component: AdminSeasonForm
      },
      {
        path: 'season/:id',
        component: AdminSeason,
        props: true
      },
      {
        path: 'season/:id/edit',
        component: AdminSeasonForm,
        props: true
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    async beforeEnter (to, from, next) {
      await store.dispatch('auth/initAuthentication')
      if (await store.dispatch('auth/isAuthenticated')) next("/admin")
      else next()
    }
  },
  {
    path: '/callback',
    async beforeEnter (to, from, next) {
      await store.dispatch('auth/initAuthentication')
      await store.dispatch('auth/handleRedirectCallback');

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
