export default {
  namespaced: true,
  state: () => ({
    allTracks: [], // 所有导入的轨迹（含 JSON 内容）
    selectedTitles: [], // 用户当前选择显示的轨迹标题
  }),
  mutations: {
    setTracks(state, trackList) {
      state.allTracks = trackList;
    },
    setSelectedTitles(state, titles) {
      state.selectedTitles = titles;
    },
    clearTracks(state) {
      state.allTracks = [];
      state.selectedTitles = [];
    },
  },
  getters: {
    selectedTracks(state) {
      return state.allTracks.filter((t) =>
        state.selectedTitles.includes(t.title)
      );
    },
  },
};
