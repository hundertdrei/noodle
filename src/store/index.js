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

let refreshTime = 30 * 1000; // time in milliseconds

Vue.use(Vuex)

function handleAPIError(error) {
  alert("API ist nicht erreichbar: " + error);
}

// Split Values into Buckets
//
// For a sorted array of values find the maximum value in an array
// of sorted "split" values which is smaller or equal to this values.
// Essentially this puts the `values` array into buckets separated
// by the `split` values. If no split value is smaller than a given
// value, -1 is returned.
//
// # example:
// values = [1, 2, 3, 4, 5, 6]
// splits = [2, 4]
// => [-1, 2, 2, 4, 4, 4]
function bucket (values, splits) {
  let v = 0
  let s = 0
  let res = []

  while (v < values.length) {
    // chooose current split
    if (splits[s] !== undefined && splits[s + 1] !== undefined && splits[s + 1] <= values[v]) {
      s = s + 1
      continue
    }
    res.push((splits[s] !== undefined && splits[s] <= values[v]) ? splits[s] : -1)
    v = v + 1
  }

  return res
}

export default new Vuex.Store({
  state: {
    players: [],
    player: null,
    nextTrainings: [],
    trainings: [],
    attendance: [],
    courses: [],
    seasons: {},
    pendingRefreshTimeout: null
  },
  getters: {
    calendar (state) {
      // Combine week and week year so weeks get properly ordered across year changes
      let trainings = _.map(state.trainings, o => {
        o.weekIndex = dayjs(o.trainingDate).isoWeek() + 100 * dayjs(o.trainingDate).isoWeekYear()
        return o
      })

      let weeks = _.groupBy(trainings, "weekIndex");

      let calendar = _.map(weeks, w => ({
        "days": _.groupBy(w, o => dayjs(o.trainingDate).isoWeekday()),
        "weekIndex": w[0].weekIndex
      }));

      let weekIndices = _.map(calendar, "weekIndex")

      let seasonWeeks = _.keys(state.seasons)

      let buckets = bucket(weekIndices, seasonWeeks)

      calendar = _.merge(calendar, _.map(buckets, o => ({"weekBucket": o})))
      
      let grouped = _.values(_.groupBy(calendar, "weekBucket"));

      return _.sortBy(grouped, o => o[0].weekBucket);
    },
    apiToken (state, getters, rootState) {
      return rootState.auth.apiToken;
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
        let a = state.nextTrainings[t].attendees.findIndex(o => o.player.playerId == player.playerId)
        if (a == -1) state.nextTrainings[t].attendees.push({attend, player})
        else Vue.set(state.nextTrainings[t].attendees, a, {attend, player})
      }
    },
    updateCourses (state, courses) {
      state.courses = _.orderBy(courses, ["dateBegin"], ["desc"]);
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
    },
    updateSeasons (state, seasons) {
      state.seasons = _.keyBy(seasons, o => dayjs(o.date).isoWeek() + 100 * dayjs(o.date).isoWeekYear());
    },
    updateSeason (state, season) {
      let key = _.findKey(state.seasons, o => o.date == season.date);

      if (key === undefined) {
        key = dayjs(season.date).isoWeek() + 100 * dayjs(season.date).isoWeekYear()
      }
      
      Vue.set(state.seasons, key, season)
    },
    deleteSeason(state, id) {
      let key = _.findKey(state.seasons, o => o.seasonId == id);

      if (key === undefined) return;

      Vue.delete(state.seasons, key)
    },
  },
  actions: {
    getNextTrainings ({ commit, dispatch, state }) {
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
       .catch(handleAPIError)

      if (state.pendingRefreshTimeout != null) clearTimeout(state.pendingRefreshTimeout);
      state.pendingRefreshTimeout = setTimeout(function () { dispatch('getNextTrainings') }, refreshTime);
    },
    getTrainings ({ commit }) {
      let lower = dayjs().format('YYYY-MM-DD')
      axios.post('', {
        query: `
        query {
          trainings: dim_training(order_by: {training_date: asc}, where: {training_date: {_gte: "'${lower}'"}}) {
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
      .catch(handleAPIError)
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
      .catch(handleAPIError)
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
      .catch(handleAPIError)


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
      .catch(handleAPIError)

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
      .catch(handleAPIError)
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
      .catch(handleAPIError)

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
      .catch(handleAPIError)
    },
    async saveCourse ({commit, getters}, course) {
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
          },
        },
        {
          headers: {
            Authorization: `Bearer ${getters.apiToken}`
          }
        }
      )
      .catch(handleAPIError)

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
    addTraining({state, commit, getters}, training) {
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
        },
        {
          headers: {
            Authorization: `Bearer ${getters.apiToken}`
          }
        }
      )
      .then(res => {
        M.toast({html: 'Training wurde aktualisiert', classes: 'green'})
        commit('updateTraining', res.data.data.training)
      })
      .catch(handleAPIError)

    },
    async deleteTraining ({commit, getters}, trainingId) {
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
        },
        {
          headers: {
            Authorization: `Bearer ${getters.apiToken}`
          }
        }
      )
      .catch(handleAPIError)

      commit('deleteTraining', {
        trainingId: res.data.data.training.trainingId,
        courseId: res.data.data.training.courseId
      })

      M.toast({html: 'Training wurde gelöscht', classes: 'green'})

      return res.data.data.training.trainingId;
    },
    async deleteCourse ({commit, getters}, courseId) {
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
        },
        {
          headers: {
            Authorization: `Bearer ${getters.apiToken}`
          }
        }
      )
      .catch(handleAPIError)

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
    getSeasons ({ commit }) {
      axios.post(
        '',
        {
          query: `
          query {
            seasons: fact_season {
              seasonId: season_id
              date
              name
            }
          }
          `
        }
      )
      .then(res => {
        commit('updateSeasons', res.data.data.seasons)
      })
      .catch(handleAPIError)
    },
    async saveSeason ({commit, getters}, season) {
      let object = {
        season_id: season.seasonId,
        name: season.name,
        date: season.date
      }
      
      const res = await axios.post(
        '',
        {
          query: `
          mutation ($object: fact_season_insert_input! ) {
            season: insert_fact_season_one (
              object: $object,
              on_conflict: {
                constraint: fact_season_pkey,
                update_columns: [name, date]
              }
              ) {
                seasonId: season_id
                date
                name
              }
            }`,
            variables: {
              object: object
            },
          },
          {
            headers: {
              Authorization: `Bearer ${getters.apiToken}`
            }
          }
          )
          .catch(handleAPIError)
          
      commit('updateSeason', res.data.data.season)

      M.toast({html: 'Saison wurde aktualisiert', classes: 'green'})

      return res.data.data.season.seasonId;
    },    
    async deleteSeason ({commit, getters}, id) {
      const res = await axios.post(
        '',
        {
          query: `
          mutation {
            season: delete_fact_season_by_pk(season_id: ${id}) {
              seasonId: season_id
            }
          }
          `
        },
        {
          headers: {
            Authorization: `Bearer ${getters.apiToken}`
          }
        }
      )
      .catch(handleAPIError)

      commit('deleteSeason', res.data.data.season.seasonId)

      M.toast({html: 'Saison wurde gelöscht', classes: 'green'})

      return res.data.data.season.seasonId;
    },
  },
  modules: {
    auth: auth
  }
})
