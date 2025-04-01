// store/modules/replay.js
export default {
  namespaced: true,
  state: () => ({
    isReplaying: false,
    replayData: [],
    currentIndex: 0,
  }),
  getters: {
    totalFrames: (state) => state.replayData.length,
    progress: (state) =>
      state.replayData.length
        ? Math.round((state.currentIndex / state.replayData.length) * 100)
        : 0,
  },
  mutations: {
    LOAD_REPLAY_DATA(state, data) {
      state.replayData = data;
      state.currentIndex = 0;
      state.isReplaying = true;
    },
    STOP_REPLAY(state) {
      state.isReplaying = false;
      state.replayData = [];
      state.currentIndex = 0;
    },
    NEXT_FRAME(state) {
      if (state.currentIndex < state.replayData.length - 1) {
        state.currentIndex++;
      } else {
        state.isReplaying = false;
      }
    },
  },
  actions: {
    loadReplayData({ commit }, data) {
      commit("LOAD_REPLAY_DATA", data);
    },
    stopReplay({ commit }) {
      commit("STOP_REPLAY");
    },
    nextFrame({ commit }) {
      commit("NEXT_FRAME");
    },
  },
};
