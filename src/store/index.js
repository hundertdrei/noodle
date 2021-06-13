import Vue from 'vue'
import Vuex from 'vuex'
import createAuth0Client from '@auth0/auth0-spa-js';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth0: null
  },
  mutations: {
    setAuthenticationInstance (state, auth0) {
      state.auth0 = auth0;
    }
  },
  actions: {
    async initAuthentication ({ state, commit }) {
      if (state.auth0 !== null) return;

      const auth0 = await createAuth0Client({
        domain: 'hundertdrei.eu.auth0.com',
        client_id: '1bPFbQUwSBTqRQGjGeBQyLZLs8CItlbv',
        redirect_uri: 'http://localhost:8080/callback'
      });

      commit("setAuthenticationInstance", auth0)
    },
    async handleRedirectCallback ({ state }) {
      await state.auth0.handleRedirectCallback()
    },
    async isAuthenticated ({ state }) {
      return await state.auth0.isAuthenticated()
    },
    logout ({ state }) {
      state.auth0.logout({
        returnTo: 'http://localhost:8080/'
      })
    },
    login ({ state }) {
      state.auth0.loginWithRedirect()
    }
  },
  modules: {
  }
})
