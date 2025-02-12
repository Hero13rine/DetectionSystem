<template>
  <el-container>
    <el-main>
      <el-alert v-if="!isConnected" type="error">WebSocket 连接断开，正在尝试重连...</el-alert>
      <Drone3D ref="drone3DRef" />
      <el-button type="primary" @click="moveDrone">模拟移动</el-button>
    </el-main>
    <el-aside width="350px">
      <SensorPanel />
      <AlertPanel :operationClass="operationClass" />
    </el-aside>
  </el-container>

  <el-footer>
    <LogsPanel />
  </el-footer>
</template>
<script setup>
//引用部分
import { ref } from 'vue';
import Drone3D from '@/components/threejs/Drone3D.vue';
import SensorPanel from '@/components/charts/SensorPanel.vue';
import AlertPanel from '@/components/ui/AlertPanel.vue';
import LogsPanel from '@/components/ui/LogsPanel.vue';
import { useWebSocket } from '@/composables/useWebSocket';


//初始化
const drone3DRef = ref(null);
const websocketUrl = localStorage.getItem('websocketUrl') || 'ws://localhost:8765';
const operationClass = ref("normal");

const { isConnected } = useWebSocket(websocketUrl, (latestData) => {

  if (drone3DRef.value) {
    drone3DRef.value.updateAirplaneState(latestData);
  }
  console.log("🚀 接收到数据:", latestData);
  // **解析 operation_class 并更新 faults**
  // **解析 operation_class 并更新 faults**
  operationClass.value = latestData.operation_class;


});

const moveDrone = () => {
  if (drone3DRef.value) {
    drone3DRef.value.updateAirplaneState({
      position: { x: Math.random() * 10 - 5, y: Math.random() * 5, z: Math.random() * -10 },
      rotation: { x: Math.random() * 0.2 - 0.1, y: Math.random() * 0.2 - 0.1, z: Math.random() * 0.2 - 0.1 }
    });
  }
};
</script>
