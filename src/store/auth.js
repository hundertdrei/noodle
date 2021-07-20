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
        domain: process.env.VUE_APP_AUTH0_DOMAIN,
        client_id: process.env.VUE_APP_AUTH0_CLIENT_ID,
        redirect_uri: process.env.VUE_APP_AUTH0_REDIRECT_URL
      });

      commit("setAuthenticationInstance", auth0)
    },
    async handleRedirectCallback({ state }) {
      await state.auth0.handleRedirectCallback()
    },
    async isAuthenticated ({ state, commit }) {
      const authenticated = await state.auth0.isAuthenticated();
      commit('setAuthenticated', authenticated)
      return authenticated;
    },
    logout({ state }) {
      state.auth0.logout({
        returnTo: process.env.VUE_APP_AUTH0_RETURN_URL
      })
    },
    login({ state }) {
      state.auth0.loginWithRedirect()
    },
  }
}