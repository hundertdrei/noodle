import createAuth0Client from '@auth0/auth0-spa-js';

export default {
  namespaced: true,
  state() {
    return {
      auth0: null,
      authenticated: false,
      apiToken: null,
      isAdmin: false,
      info: {}
    }
  },
  mutations: {
    setAuthenticationInstance(state, auth0) {
      state.auth0 = auth0;
    },
    setAuthenticated(state, value) {
      state.authenticated = value;
    },
    setAPIToken(state, value) {
      state.apiToken = value;
    },
    setAdminStatus(state, value) {
      state.isAdmin = value;
    },
    setInfo(state, value) {
      state.info = value;
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

      if (authenticated) {
        const claims = await state.auth0.getIdTokenClaims()
        commit('setInfo', claims)
        commit('setAPIToken', claims.__raw)
        commit('setAdminStatus', claims["https://noodlelab.de"].is_admin ? true : false)
      }
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