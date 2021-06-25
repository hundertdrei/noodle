import Vue from 'vue'
import Vuex from 'vuex'
import createAuth0Client from '@auth0/auth0-spa-js';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:7070/v1/graphql'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth0: null,
    players: []
  },
  mutations: {
    setAuthenticationInstance (state, auth0) {
      state.auth0 = auth0;
    },
    updatePlayers (state, players) {
      state.players = players;
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
    },
    async getPlayers ({ commit }) {
      const result = await axios.post(
        '',
        {
          query: `
            query {
              players: dim_player {
                playerName: player_name
                playerId: player_id
              }
            }
          `
        }
      ).catch(() => alert('Error fetching from API'))

      console.log(result)

      commit('updatePlayers', result.data.data.players)
    },
    async getPlayersToken ({ commit, state }) {
      const claims = await state.auth0.getIdTokenClaims()
      console.log(claims)
      const result = await axios.post(
        '',
        {
          query: `
            query {
              players: dim_player {
                playerName: player_name
                playerId: player_id
              }
            }
          `
        },
        {
          headers: {
            Authorization: `Bearer ${claims.__raw}`
          }
        }
      ).catch(() => alert('Error fetching from API'))

      commit('updatePlayers', result.data.data.players)
    }
  },
  modules: {
  }
})
