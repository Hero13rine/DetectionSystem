import { createStore } from "vuex";
import replay from "./modules/replayStore";
import adsbTrack from "./modules/adsbTrack";


export default createStore({
  modules: {
    replay,
    adsbTrack,
  },
});
