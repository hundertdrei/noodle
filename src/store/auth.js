import createAuth0Client from '@auth0/auth0-spa-js';

export default {
  namespaced: true,
  state() {
    return {
      auth0: null,
      authenticated: false
    }
  },
  mutations: {
    setAuthenticationInstance(state, auth0) {
      state.auth0 = auth0;
    },
    setAuthenticated(state, value) {
      state.authenticated = value;
    }
  },
  actions: {
    async initAuthentication({ state, commit }) {
      if (state.auth0 !== null) return;

      const auth0 = await createAuth0Client({
        domain: 'hundertdrei.eu.auth0.com',
        client_id: '1bPFbQUwSBTqRQGjGeBQyLZLs8CItlbv',
        redirect_uri: 'http://localhost:8080/callback'
      });

      commit("setAuthenticationInstance", auth0)
    },
    async handleRedirectCallback({ state }) {
      await state.auth0.handleRedirectCallback()
    },
    // async isAuthenticated ({ state }) {
    //   return await state.auth0.isAuthenticated()
    // },
    isAuthenticated({ commit }) {
      commit('setAuthenticated', false)
      return false;
    },
    logout({ state }) {
      state.auth0.logout({
        returnTo: 'http://localhost:8080/'
      })
    },
    login({ state }) {
      state.auth0.loginWithRedirect()
    },
  }
}