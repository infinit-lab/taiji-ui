import Vue from "vue";
import Vuex from "vuex";
import yolanda from "yolanda-ui";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {
    setToken(state, token) {
      yolanda.setToken(token);
      if (token === "") {
        window.localStorage.removeItem("token");
      } else {
        window.localStorage.setItem("token", token);
      }
    },
    setUsername(state, username) {
      window.localStorage.setItem("username", username);
    },
    setRemember(state, remember) {
      window.localStorage.setItem("remember", remember);
    }
  },
  getters: {
    getToken() {
      const token = window.localStorage.getItem("token");
      return token === null ? "" : token;
    },
    getUsername() {
      const username = window.localStorage.getItem("username");
      return username === null ? "" : username;
    },
    getRemember() {
      return window.localStorage.getItem("remember") === "true" ? true : false;
    }
  },
  actions: {},
  modules: {}
});
