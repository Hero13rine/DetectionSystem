<template>
  <el-container>
    <el-main>
      <el-alert v-if="isReplaying" title="当前为回放模式" type="info" show-icon :closable="false"
        style="margin-bottom: 12px" />
      <Drone3D ref="drone3DRef" v-show="isVisible" />
    </el-main>
    <el-aside width="350px">
      <el-button type="primary" @click="reset"> reset </el-button>
      <el-button type="danger" @click="clearTrail">清除轨迹</el-button>
      <el-button :type="isListening ? 'success' : 'danger'" @click="toggleListening"
        :icon="isListening ? 'el-icon-check' : 'el-icon-close'">
        {{ isListening ? "监听中" : "已暂停" }}
      </el-button>
      <SensorPanel :sensorData="isReplaying ? replaySensorDataList : sensorData" :flightInfo="flightInfo" />
      <AlertPanel :operationClass="operationClass" />
      <el-alert v-if="!isReplaying && !isConnected" type="error">WebSocket 连接断开，正在尝试重连...</el-alert>
      <el-alert v-if="!isReplaying && !isListening" type="error">已暂停接收...</el-alert>

    </el-aside>
  </el-container>
  <el-footer>
    <LogsPanel :flightInfo="flightInfo" :operationClass="operationClass" />
  </el-footer>
  <!-- DashboardView.vue - template 最底部插入 -->
  <!-- 🎮 回放控制条浮层 -->
  <div v-if="store.state.replay.isReplaying" class="replay-controls-bar">
    <!-- 暂停 / 播放 -->
    <el-button circle @click="togglePause" :icon="isPaused ? VideoPlay : VideoPause" />
    <!-- 倍速 -->
    <el-select v-model="playSpeed" @change="changeSpeed" style="width: 80px">
      <el-option label="1x" :value="1" />
      <el-option label="2x" :value="2" />
      <el-option label="4x" :value="4" />
    </el-select>
    <!-- 进度条 -->
    <el-slider v-model="sliderValue" :min="0" :max="maxFrame" :format-tooltip="formatTooltip" @input="onSliderChange" />

    <el-button type="danger" plain @click="exitReplay">
      <i class="el-icon-close"></i> 退出回放
    </el-button>

  </div>
</template>

<script setup>
//引用部分
import { ref, computed, watch, onUnmounted } from 'vue';
import { useRoute } from "vue-router";
import Drone3D from '@/components/threejs/Drone3D.vue';
import SensorPanel from '@/components/charts/SensorPanel.vue';
import AlertPanel from '@/components/ui/AlertPanel.vue';
import LogsPanel from '@/components/ui/LogsPanel.vue';
import { useWebSocket } from '@/composables/useWebSocket';
import { saveLog } from "@/utils/logStorage";
import { useStore } from 'vuex'
import { VideoPause, VideoPlay } from '@element-plus/icons-vue'
const route = useRoute();
const store = useStore()

//初始化
const isVisible = computed(() => route.path === "/"); // 只有在 "/" 页面时才显示
const drone3DRef = ref(null);
const websocketUrl = localStorage.getItem('websocketUrl') || 'ws://localhost:8765';
const operationClass = ref("normal");
const isReplaying = computed(() => store.state.replay.isReplaying)
//回放
const isPaused = ref(true)
const playSpeed = ref(1)
const sliderValue = ref(0)
let replayTimer = null
const replaySensorDataList = ref([])  // 这是给 SensorPanel 用的



const { isConnected, flightInfo, sensorData, isListening, toggleListening } = useWebSocket(
  websocketUrl,
  (latestData) => {
    // ❗ 只在非回放时处理数据
    if (!isReplaying.value) {
      if (drone3DRef.value) {
        const { position, rotation, operation_class } = latestData;
        drone3DRef.value.updateAirplaneState({ position, rotation, operation_class });
      }

      operationClass.value = latestData.operation_class;
      saveLog({ flightInfo: flightInfo.value, sensor_data: latestData });
    }
  }
)

// **当 flightInfo 发生变化时，清除轨迹**
watch(flightInfo, (newFlightInfo) => {
  if (drone3DRef.value && newFlightInfo) {
    drone3DRef.value.clearTrail(); // 清除现有轨迹
  }
});

const reset = () => {
  if (drone3DRef.value) {
    drone3DRef.value.updateAirplaneState({
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    });
  }
};

//清除轨迹
const clearTrail = () => {
  if (drone3DRef.value) {
    drone3DRef.value.clearTrail(); // 调用清除轨迹方法
  }
};

// 倍速切换
const changeSpeed = () => {
  if (!isPaused.value) startReplay()
}

//进度条拖动
const onSliderChange = (val) => {
  if (store.state.replay.replayData.length === 0) return
  const frame = store.state.replay.replayData[val]
  store.state.replay.currentIndex = val
  if (frame && drone3DRef.value) {
    drone3DRef.value.updateAirplaneState(frame)
    operationClass.value = frame.operation_class

    replaySensorDataList.value = store.state.replay.replayData.slice(
      Math.max(0, val - 100),
      val + 1
    )

  }
}

// 播放器主逻辑
const startReplay = () => {
  clearInterval(replayTimer)
  replayTimer = setInterval(() => {
    if (isPaused.value) return

    store.dispatch('replay/nextFrame')
    const index = store.state.replay.currentIndex
    const frame = store.state.replay.replayData[index]

    sliderValue.value = index

    if (frame && drone3DRef.value) {
      drone3DRef.value.updateAirplaneState(frame)
      // 替换旧数据，保留全部历史
      operationClass.value = frame.operation_class  // ✅ 更新警告状态
      replaySensorDataList.value = store.state.replay.replayData.slice(
        Math.max(0, index - 100),
        index + 1
      )


    }

    if (!store.state.replay.isReplaying) {
      clearInterval(replayTimer)
      isPaused.value = true
    }
  }, 250 / playSpeed.value)
}

// 暂停 / 播放切换
const togglePause = () => {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    clearInterval(replayTimer)
  } else {
    startReplay()
  }
}

//进度条最大值
const maxFrame = computed(() => {
  const len = store.state.replay.replayData.length
  return len > 0 ? len - 1 : 0
})

//退出
const exitReplay = () => {
  // 停止播放
  clearInterval(replayTimer)
  isPaused.value = true

  // 清空图表数据
  replaySensorDataList.value = []

  // 重置状态变量
  sliderValue.value = 0
  operationClass.value = 'normal'

  // 停止回放标志
  store.dispatch('replay/stopReplay')

  // 清空轨迹 + 重置姿态
  if (drone3DRef.value) {
    drone3DRef.value.clearTrail?.()
    reset()
  }
}


// 监听回放状态，一旦开启，就自动 startReplay
watch(() => store.state.replay.isReplaying, (val) => {
  if (val) {
    isPaused.value = false
    playSpeed.value = 1
    sliderValue.value = 0
    startReplay()
  }
})

// 当组件销毁时，清除定时器，防止内存泄漏
onUnmounted(() => {
  if (replayTimer) clearInterval(replayTimer)
})
</script>

<style scoped>
.replay-controls-bar {
  position: fixed;
  top: 9px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  width: 90%;
  max-width: 960px;
}
</style>