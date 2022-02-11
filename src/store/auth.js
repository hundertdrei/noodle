import createAuth0Client from '@auth0/auth0-spa-js';

export default {
  namespaced: true,
  state() {
    return {
      auth0: null,
      authenticated: false,
      apiToken: null
    }
  },
  mutations: {
    setAuthenticated(state, value) {
      state.authenticated = value;
    },
    setAPIToken(state, value) {
      state.apiToken = value;
    }
  },
  actions: {
    async initAuthentication({ state, dispatch }) {
      if (state.auth0 !== null) return;

      state.auth0 = createAuth0Client({
        domain: process.env.VUE_APP_AUTH0_DOMAIN,
        client_id: process.env.VUE_APP_AUTH0_CLIENT_ID,
        redirect_uri: process.env.VUE_APP_AUTH0_REDIRECT_URL
      }).then(auth0 => {
        // Update authenticated flag after auth0 was created
        dispatch('isAuth0Authenticated', auth0);
        return auth0;
      });
    },
    async handleRedirectCallback({ state }) {
      let auth0 = await state.auth0;
      await auth0.handleRedirectCallback()
    },
    // Set authenticated flag from an explicit auth0 instance
    async isAuth0Authenticated({ commit }, auth0) {
      const authenticated = await auth0.isAuthenticated();

      if (authenticated) {
        const claims = await auth0.getIdTokenClaims()
        commit('setAPIToken', claims.__raw)
      }
      commit('setAuthenticated', authenticated)

      return authenticated;
    },
    // Set authenticated flag from an state auth0
    async isAuthenticated({ state, dispatch }) {
      let auth0 = await state.auth0;
      return await dispatch('isAuth0Authenticated', auth0);
    },
    async logout({ state }) {
      let auth0 = await state.auth0;
      auth0.logout({
        returnTo: process.env.VUE_APP_AUTH0_RETURN_URL
      })
    },
    async login({ state }) {
      let auth0 = await state.auth0;
      auth0.loginWithRedirect()
    },
  }
}