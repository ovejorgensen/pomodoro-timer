import { createStore, createLogger } from "vuex";

export default createStore({
  state: {},
  mutations: {},
  actions: {},
  modules: {},
  plugins: process.env.NODE_ENV === "development" ? [createLogger()] : []
});
