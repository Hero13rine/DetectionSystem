import { createStore } from "vuex";
import replay from "./modules/replayStore";

export default createStore({
  modules: {
    replay,
  },
});
