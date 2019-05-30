// import { login, logout, getInfo } from '@/api/user'
// import { getToken, setToken, removeToken } from '@/utils/auth'
// import router, { resetRouter } from '@/router'
// logout,
import { login, getUserInfo, getUser, postUser, putUser, deleteUser } from '@/api/user'
import { getToken, setToken, removeToken } from '@/assets/js/auth'
// import router, { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  // role: '',
  desc: '',
  // introduction: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  // SET_INTRODUCTION: (state, introduction) => {
  //   state.introduction = introduction
  // },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  // SET_ROLE: (state, role) => {
  //   state.role = role
  // },
  SET_DESC: (state, desc) => {
    state.desc = desc
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password.trim() }).then(res => {
        // const { data } = response
        // commit('SET_TOKEN', data.token)
        // setToken(data.token)
        // resolve()
        console.log(res)
        if (res.success) {
          setToken(res.data.token) // 把token存在cookie
          commit('SET_TOKEN', res.data.token)
          console.log(res.data.token)
        }
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getUserInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      // state.token
      getUserInfo().then(res => {
        // const { data } = response

        // if (!data) {
        //   reject('Verification failed, please Login again.')
        // }

        // const { roles, name, avatar, introduction } = data

        // // roles must be a non-empty array
        // if (!roles || roles.length <= 0) {
        //   reject('getInfo: roles must be a non-null array!')
        // }

        // commit('SET_ROLES', roles)
        // commit('SET_NAME', name)
        // commit('SET_AVATAR', avatar)
        // commit('SET_INTRODUCTION', introduction)
        // resolve(data)
        if (res.success) {
          commit('SET_NAME', res.data.username)
          commit('SET_ROLES', res.data.role.split(','))
          commit('SET_DESC', res.data.desc)
          commit('SET_AVATAR', res.data.avatar)
          resolve(res)
        } else {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject('getUserInfo: user must be a non-null object !')
        }
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      // logout(state.token).then(() => {
      //   commit('SET_TOKEN', '')
      //   commit('SET_ROLES', [])
      //   removeToken()
      //   resetRouter()
      //   resolve()
      // }).catch(error => {
      //   reject(error)
      // })
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      removeToken()
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      // commit('SET_ROLE', '')
      removeToken()
      resolve()
    })
  },

  getUser({ commit }, params) {
    return new Promise((resolve, reject) => {
      getUser(params).then(res => {
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    })
  },

  postUser({ commit }, params) {
    return new Promise((resolve, reject) => {
      postUser(params).then(res => {
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    })
  },

  putUser({ commit }, params) {
    return new Promise((resolve, reject) => {
      putUser(params).then(res => {
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    })
  },

  deleteUser({ commit }, params) {
    return new Promise((resolve, reject) => {
      deleteUser(params).then(res => {
        resolve(res)
      }).catch(error => {
        reject(error)
      })
    })
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
