<template>
    <div class="sensor-panel">
        <h3>🛠 传感器数据面板</h3>
        <p v-if="sensorData.length === 0">⏳ 等待数据传入...</p>
        <p v-else>✅ 数据已接收，数据点数量: {{ sensorData.length }}</p>

        <!-- ✅ 传递数据给 SensorChart.vue -->
        <SensorChart :sensorData="sensorData" />
    </div>
</template>

<script setup>
import { defineProps, watch } from "vue";
import SensorChart from "@/components/charts/SensorChart.vue";

// ✅ 接收 `sensorData` 作为 `prop`
const props = defineProps({
    sensorData: {
        type: Array,
        required: true,
    },
});

// ✅ 监听 `sensorData` 变化，输出到控制台
watch(
    () => props.sensorData,
    (newData) => {
        console.log("📡 SensorPanel.vue 接收到的新数据:", newData);
    },
    { deep: true }
);
</script>

<style scoped>
.sensor-panel {
    padding: 10px;
    background: #fff;
    border-radius: 5px;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
}
</style>
