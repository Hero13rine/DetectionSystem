import { createStore } from "vuex";

export default createStore({
  state: {
    droneStatus: null,
  },
  mutations: {
    updateDroneStatus(state, data) {
      state.droneStatus = data;
    },
  },
  actions: {
    fetchDroneStatus({ commit }, data) {
      commit("updateDroneStatus", data);
    },
  },
  getters: {
    getDroneStatus: (state) => state.droneStatus,
  },
});
