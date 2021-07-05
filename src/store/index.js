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
    },
    updateCourse(state, course) {
      let i = state.courses.findIndex(o => o.courseId == course.courseId);

      if (i == -1) state.courses.push(course)
      else Vue.set(state.courses, i, course)
    },
    updateTraining(state, training) {
      let i = state.courses.findIndex(o => o.courseId == training.courseId);

      if (i == -1) {
        console.log("could not find course")
        return;
      }
      let j = state.courses[i].trainings.findIndex(o => o.trainingDate == training.trainingDate)

      if (j == -1) state.courses[i].trainings.push(training)
      else Vue.set(state.courses[i].trainings, j, training)
    },
    deleteCourse(state, courseId) {
      let i = state.courses.findIndex(o => o.courseId == courseId);

      if (i == -1) return;

      Vue.delete(state.courses, i)
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
              dayOfWeek: day_of_week
              comment
              trainings: dim_trainings {
                trainingDate: training_date
              }
            }
          }
          `
        }
      )
      .then(res => commit('updateCourses', res.data.data.courses))
    },
    async saveCourse ({commit}, course) {
      let object = {
        title: course.title,
        title_short: course.titleShort,
        date_begin: course.dateBegin,
        date_end: course.dateEnd,
        time_begin: course.timeBegin,
        time_end: course.timeEnd,
        comment: course.comment,
        location: course.location,
        day_of_week: course.dayOfWeek
      };

      if (course.courseId) {
        object.course_id = course.courseId;
      }

      const res = await axios.post(
        '',
        {
          query: `
          mutation ($object: dim_course_insert_input! ) {
            course: insert_dim_course_one (
              object: $object,
              on_conflict: {
                constraint: dim_course_pkey,
                update_columns: [title, title_short, date_begin, date_end, time_begin, time_end, location, comment]
              }
            ) {
              courseId: course_id
              title
              titleShort: title_short
              location
              timeBegin: time_begin
              timeEnd: time_end
              dateBegin: date_begin
              dateEnd: date_end
              dayOfWeek: day_of_week
              comment,
              trainings: dim_training {
                date
              }
            }
          }`,
          variables: {
            object: object
          }
        }
      )
      console.log(res);
      commit('updateCourse', res.data.data.course)
      return res.data.data.course.courseId;
    },
    fillTrainings({state, dispatch}, courseId) {
      let course = state.courses.filter(o => o.courseId == courseId)[0]

      let startDate = dayjs(course.dateBegin);
      let endDate = dayjs(course.dateEnd);
      
      let d = startDate.isoWeekday(course.dayOfWeek);

      if (d < startDate) d = d.add(7, 'day');
      
      while (d < endDate) {
        dispatch('addTraining', {courseId, date: d.format('YYYY-MM-DD')})
        d = d.add(7, 'day');
      }
    },
    addTraining({state, commit}, {courseId, date}) {
      let i = state.courses.findIndex(o => o.courseId == courseId)
      if (i == -1) return;

      let j = state.courses[i].trainings.findIndex(o => o.trainingDate == date)
      if (j != -1) return;

      let object = {
        training_date: date,
        course_id: courseId
      }

      axios.post(
        '',
        {
          query: `
          mutation ($object: dim_training_insert_input! ) {
            training: insert_dim_training_one(
              object: $object,
              on_conflict: {
                constraint: dim_training_pkey,
                update_columns: [course_id, training_date]
              }
            ) {
              trainingDate: training_date
              trainingId: training_id
              timeEnd: time_end
              timeBegin: time_begin
              location
              cancelled
              comment
              courseId: course_id
            }
          }        
          `,
          variables: {
            object: object
          }
        }
      )
      .then(res => {
        console.log(res)
        commit('updateTraining', res.data.data.training)
      })
    },
    async deleteCourse ({commit}, courseId) {
      const res = await axios.post(
        '',
        {
          query: `
          mutation  {
            course: delete_dim_course_by_pk(course_id: ${courseId}) {
              courseId: course_id
            }
          }
          `
        }
      )
      commit('deleteCourse', res.data.data.course.courseId)

      return res.data.data.course.courseId;
    }
  },
  modules: {
  }
})
