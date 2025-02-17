<template>
  <el-container>

    <el-main>
      <Drone3D ref="drone3DRef" v-show="isVisible" />
    </el-main>
    <el-aside width="350px">
      <el-button type="primary" @click="moveDrone">模拟移动</el-button>
      <SensorPanel />
      <AlertPanel :operationClass="operationClass" />
      <el-alert v-if="!isConnected" type="error">WebSocket 连接断开，正在尝试重连...</el-alert>
    </el-aside>
  </el-container>

  <el-footer>
    <LogsPanel />
  </el-footer>
</template>
<script setup>
//引用部分
import { ref } from 'vue';
import { computed } from "vue";
import { useRoute } from "vue-router";
import Drone3D from '@/components/threejs/Drone3D.vue';
import SensorPanel from '@/components/charts/SensorPanel.vue';
import AlertPanel from '@/components/ui/AlertPanel.vue';
import LogsPanel from '@/components/ui/LogsPanel.vue';
import { useWebSocket } from '@/composables/useWebSocket';
import { saveLog } from "@/utils/logStorage";


const route = useRoute();
const isVisible = computed(() => route.path === "/"); // 只有在 "/" 页面时才显示
//初始化
const drone3DRef = ref(null);
const websocketUrl = localStorage.getItem('websocketUrl') || 'ws://localhost:8765';
const operationClass = ref("normal");

const { isConnected, flightInfo } = useWebSocket(websocketUrl, (latestData) => {

  if (drone3DRef.value) {
    const { position, rotation } = latestData
    drone3DRef.value.updateAirplaneState({ position, rotation });
  }
  // console.log("🚀 接收到数据:",flightInfo.value);
  // **解析 operation_class 并更新 faults** 
  operationClass.value = latestData.operation_class;
  saveLog({ flightInfo: flightInfo.value, sensor_data: latestData });

});

const moveDrone = () => {
  if (drone3DRef.value) {
    drone3DRef.value.updateAirplaneState({
      position: { x: 0, y: 1, z: 0 },
      rotation: { x: 0, y: 0, z: 0 }
    });
  }
};
</script>
