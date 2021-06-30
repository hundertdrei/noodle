import Vue from 'vue'
import Vuex from 'vuex'
import createAuth0Client from '@auth0/auth0-spa-js';
import axios from 'axios';
import _ from 'lodash';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

axios.defaults.baseURL = 'http://localhost:7070/v1/graphql'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    auth0: null,
    players: [],
    player: null,
    nextTrainings: [],
    trainings: [],
    attendance: [],
    courses: []
  },
  getters: {
    calendar (state) {
      let weeks = _.groupBy(state.trainings, o => dayjs(o.trainingDate).isoWeek());
      let calendar = _.map(weeks, w => _.groupBy(w, o => dayjs(o.trainingDate).isoWeekday()));

      return calendar;
    },
    calendarDays (state) {
      let days = _.map(state.trainings, o => dayjs(o.trainingDate).isoWeekday())
      return _.uniq(days).sort();
    }
  },
  mutations: {
    setAuthenticationInstance (state, auth0) {
      state.auth0 = auth0;
    },
    updatePlayers (state, players) {
      state.players = players;
    },
    updateNextTrainings (state, trainings) {
      state.nextTrainings = trainings;
    },
    updateTrainings (state, trainings) {
      state.trainings = trainings
    },
    setPlayerAttendance (state, attendance) {
      state.attendance = attendance
    },
    updatePlayer (state, player) {
      state.player = player;
    },
    addPlayer (state, player) {
      let i = state.players.findIndex(o => o.playerId = player.playerId)
      if (i == -1) state.players.push(player)
      else Vue.set(state.players, i, player)
    },
    updateAttendance (state, {trainingId, attend, player}) {
      let i = state.attendance.findIndex(o => o.trainingId == trainingId)
      if (i == -1) state.attendance.push({trainingId, attend})
      else Vue.set(state.attendance, i, {trainingId, attend})

      let t = state.nextTrainings.findIndex(o => o.trainingId == trainingId)
      if (t != -1) {
        let a = state.nextTrainings[t].attendees.findIndex(o => o.player.playerId = player.playerId)
        if (a == -1) state.nextTrainings[t].attendees.push({attend, player})
        else Vue.set(state.nextTrainings[t].attendees, a, {attend, player})
      }
    },
    updateCourses (state, courses) {
      state.courses = courses;
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
    isAuthenticated () {
    //async isAuthenticated ({ state }) {
      return true;
      // return await state.auth0.isAuthenticated()
    },
    logout ({ state }) {
      state.auth0.logout({
        returnTo: 'http://localhost:8080/'
      })
    },
    login ({ state }) {
      state.auth0.loginWithRedirect()
    },
    getNextTrainings ({ commit }) {
      let lower = dayjs().format('YYYY-MM-DD')
      console.log(lower)
       axios.post('', {
         query: `
         query {
          trainings: dim_training(order_by: {training_date: asc}, where: {training_date: {_gte: "'${lower}'"}}, limit: 5) {
            location
            timeBegin: time_begin
            timeEnd: time_end
            trainingDate: training_date
            trainingId: training_id
            course: dim_course {
              location
              title
              titleShort: title_short
              timeBegin: time_begin
              timeEnd: time_end,
              comment
            }
            attendees: fact_attendances {
              player: dim_player {
                name
                playerId: player_id
              }
              attend
            }
          }
        } 
         `
       }).then(res => commit('updateNextTrainings', res.data.data.trainings))
    },
    getTrainings ({ commit }) {
      let lower = dayjs().format('YYYY-MM-DD')
      axios.post('', {
        query: `
        query {
          trainings: dim_training(order_by: {training_date: asc}, where: {training_date: {_gte: "'${lower}'", _lte: "'2021-09-01'"}}) {
            location
            timeBegin: time_begin
            timeEnd: time_end
            trainingDate: training_date
            trainingId: training_id
            course: dim_course {
              location
              title
              titleShort: title_short
              timeBegin: time_begin
              timeEnd: time_end
            }
          }
        }
        `
      }).then(res => commit('updateTrainings', res.data.data.trainings))
    },
    getPlayerAttendance ({ commit, state }) {
      let player = state.player;

      if (player === null || player.playerId == -1 ) {
        commit('setPlayerAttendance', [])
        return;
      }

      axios.post(
        '',
        {
          query: `
          query {
            player: dim_player(where: {name: {_eq: "${player.name}"}}) {
              attendance: fact_attendances {
                attend
                trainingId: training_id
              }
            }
          }
          `
        }
      )
      .then(res => {
        if (res.data.data.player.length == 0) {
          commit('setPlayerAttendance', [])
        } else {
          commit('setPlayerAttendance', res.data.data.player[0].attendance)
        }
      })
    },
    async getPlayers ({ commit }) {
      const result = await axios.post(
        '',
        {
          query: `
            query {
              players: dim_player {
                name
                playerId: player_id
              }
            }
          `
        }
      ).catch(() => alert('Error fetching from API'))

      commit('updatePlayers', result.data.data.players)
    },
    async getPlayersToken ({ commit, state }) {
      const claims = await state.auth0.getIdTokenClaims()
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
    },
    setPlayer({ commit, dispatch }, player ) {
      commit('updatePlayer', player)
      dispatch('getPlayerAttendance')
    },
    async toggleAttendance({ commit, dispatch, state }, { trainingId, old} ) {
      if (!state.player || state.player.name.trim() == "") return;
      
      if (state.player.playerId == -1) {
        await dispatch('createPlayer', state.player.name)
      }

      let attend = (old === false ? 'null' : !old)
      let playerId = state.player.playerId;

      axios.post(
        '',
        {
          query: `
          mutation {
            attendance: insert_fact_attendance(objects: {player_id: ${playerId}, training_id: ${trainingId}, attend: ${attend}}, on_conflict: {constraint: fact_attendance_pkey, update_columns: attend}) {
              returning {
                player: dim_player {
                  name
                  playerId: player_id
                }
                attend
                trainingId: training_id
              }
            }
          }`
        }
      ).then(res => {
        commit('updateAttendance', res.data.data.attendance.returning[0])
      })
    },
    async createPlayer({ commit }, name) {
      if (!name || name.trim() == "") return;

      const res = await axios.post(
        '',
        {
          query: `
          mutation {
            player: insert_dim_player(objects: {name: "${name}"}) {
              returning {
                name
                playerId: player_id
              }
            }
          }
          `
        }
      )
      commit('updatePlayer', res.data.data.player.returning[0])
      commit('addPlayer', res.data.data.player.returning[0])
    },
    getCourses ({ commit }) {
      axios.post(
        '',
        {
          query: `
          query {
            courses: dim_course {,
              courseId: course_id
              title
              titleShort: title_short
              location
              timeBegin: time_begin
              timeEnd: time_end
              dateBegin: date_begin
              dateEnd: date_end
              comment
            }
          }
          `
        }
      )
      .then(res => commit('updateCourses', res.data.data.courses))
    }
  },
  modules: {
  }
})
