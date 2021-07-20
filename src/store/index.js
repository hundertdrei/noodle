import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios';
import _ from 'lodash';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear'
import isoWeek from 'dayjs/plugin/isoWeek'
import M from 'materialize-css'
import auth from '@/store/auth'

dayjs.extend(weekOfYear)
dayjs.extend(isoWeek)

axios.defaults.baseURL = process.env.VUE_APP_API_URL;

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
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
        return;
      }
      let j = state.courses[i].trainings.findIndex(o => o.trainingId == training.trainingId)

      if (j == -1) state.courses[i].trainings.push(training)
      else Vue.set(state.courses[i].trainings, j, training)
    },
    deleteCourse(state, courseId) {
      let i = state.courses.findIndex(o => o.courseId == courseId);

      if (i == -1) return;

      Vue.delete(state.courses, i)
    },
    deleteTraining(state, {courseId, trainingId }) {
      let i = state.courses.findIndex(o => o.courseId == courseId);

      if (i == -1) return;

      let j = state.courses[i].trainings.findIndex(o => o.trainingId == trainingId)

      if (j == -1) return

      Vue.delete(state.courses[i].trainings, j)
    },
    deletePlayer(state, playerId) {
      let i = state.players.findIndex(o => o.playerId == playerId);

      if (i == -1) return;

      Vue.delete(state.players, i)

      if (this.player && this.player.playerId == playerId) {
        this.player = null;
      }
    }
  },
  actions: {
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
            comment
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
       })
       .then(res => commit('updateNextTrainings', res.data.data.trainings))
       .catch(() => alert('API ist nicht erreichbar'))
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
      })
      .then(res => commit('updateTrainings', res.data.data.trainings))
      .catch(() => alert('API ist nicht erreichbar'))
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
      .catch(() => alert('API ist nicht erreichbar'))
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
      )       
      .catch(() => alert('API ist nicht erreichbar'))


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
      )
      .catch(() => alert('API ist nicht erreichbar'))

      commit('updatePlayers', result.data.data.players)
    },
    setPlayer({ commit, dispatch }, player ) {
      commit('updatePlayer', player)
      dispatch('getPlayerAttendance')
    },
    async toggleAttendance({ commit, dispatch, state }, { trainingId, old} ) {
      if (!state.player || state.player.name.trim() == "") return;
      
      if (state.player.playerId == -1) {
        await dispatch('savePlayer', {name: state.player.name})
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
      )
      .then(res => {
        commit('updateAttendance', res.data.data.attendance.returning[0])
      })
      .catch(() => alert('API ist nicht erreichbar'))
    },
    async savePlayer({ commit }, player) {
      if (!player.name || player.name.trim() == "") return;

      let object = {
        name: player.name
      };

      if (player.playerId && player.playerId !== -1) {
        object.player_id = player.playerId;
      }

      const res = await axios.post(
        '',
        {
          query: `
          mutation ($object: dim_player_insert_input!) {
            player: insert_dim_player_one (
              object: $object,
              on_conflict: {
                constraint: dim_player_pkey,
                update_columns: [name]
              }
            ) {
              name
              playerId: player_id
            }
          }
          `,
          variables: {
            object: object
          }
        }
      )
      .catch(() => alert('API ist nicht erreichbar'))

      commit('updatePlayer', res.data.data.player)
      commit('addPlayer', res.data.data.player)
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
                courseId: course_id
                trainingId: training_id
                trainingDate: training_date
                timeBegin: time_begin
                timeEnd: time_end
                location
                comment
              }
            }
          }
          `
        }
      )
      .then(res => {
        commit('updateCourses', res.data.data.courses)
      })
      .catch(() => alert('API ist nicht erreichbar'))
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
                update_columns: [title, title_short, date_begin, date_end, time_begin, time_end, location, comment, day_of_week]
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
              trainings: dim_trainings {
                trainingDate: training_date
                courseId: course_id
                trainingId: training_id
                timeBegin: time_begin
                timeEnd: time_end
                location
                comment
              }
            }
          }`,
          variables: {
            object: object
          }
        }
      )
      .catch(() => alert('API ist nicht erreichbar'))

      commit('updateCourse', res.data.data.course)

      M.toast({html: 'Kurs wurde aktualisiert', classes: 'green'})

      return res.data.data.course.courseId;
    },
    fillTrainings({state, dispatch}, courseId) {
      let course = state.courses.filter(o => o.courseId == courseId)[0]

      let startDate = dayjs(course.dateBegin);
      let endDate = dayjs(course.dateEnd);
      
      let d = startDate.isoWeekday(course.dayOfWeek);

      if (d < startDate) d = d.add(7, 'day');
      
      while (d < endDate) {
        let dateFormatted = d.format('YYYY-MM-DD')
        let j = course.trainings.findIndex(o => o.trainingDate == dateFormatted)
        if (j == -1) {
          dispatch('addTraining', {courseId, trainingDate: dateFormatted})
        }
        d = d.add(7, 'day');
      }
    },
    addTraining({state, commit}, training) {
      let i = state.courses.findIndex(o => o.courseId == training.courseId)
      if (i == -1) return;

      let object = {
        course_id: training.courseId,
        training_date: training.trainingDate,
        time_begin: training.timeBegin,
        time_end: training.timeEnd,
        location: training.location,
        comment: training.comment,
      }

      if (training.trainingId) {
        object.training_id = training.trainingId
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
                update_columns: [course_id, training_date, comment, time_begin, time_end, location]
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
        M.toast({html: 'Training wurde aktualisiert', classes: 'green'})
        commit('updateTraining', res.data.data.training)
      })
      .catch(() => alert('API ist nicht erreichbar'))

    },
    async deleteTraining ({commit}, trainingId) {
      const res = await axios.post(
        '',
        {
          query: `
          mutation  {
            training: delete_dim_training_by_pk(training_id: ${trainingId}) {
              trainingId: training_id
              courseId: course_id
            }
          }
          `
        }
      )
      .catch(() => alert('API ist nicht erreichbar'))

      commit('deleteTraining', {
        trainingId: res.data.data.training.trainingId,
        courseId: res.data.data.training.courseId
      })

      M.toast({html: 'Training wurde gelöscht', classes: 'green'})

      return res.data.data.training.trainingId;
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
      .catch(() => alert('API ist nicht erreichbar'))

      commit('deleteCourse', res.data.data.course.courseId)

      M.toast({html: 'Kurs wurde gelöscht', classes: 'green'})

      return res.data.data.course.courseId;
    },
    async deletePlayer ({commit, state}, playerId) {
      if (!playerId || playerId === -1) return;

      const res = await axios.post(
        '',
        {
          query: `
          mutation  {
            player: delete_dim_player_by_pk(player_id: ${playerId}) {
              playerId: player_id
            }
          }
          `
        }
      )
      commit('deletePlayer', res.data.data.player.playerId)

      state.nextTrainings.map(o => commit('updateAttendance', {trainingId: o.trainingId, attend: null, player: {playerId}}))

      return res.data.data.player.playerId;
    },
  },
  modules: {
    auth: auth
  }
})
