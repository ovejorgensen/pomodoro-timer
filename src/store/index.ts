import { createStore, createLogger } from "vuex";

export default createStore({
  state: {
    time: undefined,
  },
  getters: {
    time: (state) => {
      return state.time;
    }
  },
  mutations: {
    location: (state, newTime) => {
      state.time = newTime;
    },
  },
  plugins: process.env.NODE_ENV === "development" ? [createLogger()] : []
});
