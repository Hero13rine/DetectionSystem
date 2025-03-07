<template>
    <div class="sensor-panel">
        <div class="sensor-panel-header">
            <h3>📡 实时传感器数据</h3>
        </div>

        <!-- ✅ 传递数据给 SensorChart.vue -->
        <SensorChart :sensorData="sensorData" :flightInfo="flightInfo" />
    </div>
</template>

<script setup>
import { defineProps, watch } from "vue";
import SensorChart from "@/components/charts/SensorChart.vue";

// ✅ 新增 flightInfo 接收
const props = defineProps({
    sensorData: {
        type: Array,
        required: true,
    },
    flightInfo: {
        type: Object,
        required: false,
    },
});

watch(() => props.sensorData, (newData) => {
    console.log("📡 SensorPanel.vue 接收到的新数据:", newData);
}, { deep: true });

// ✅ 可以增加对flightInfo的监听用于调试
watch(() => props.flightInfo, (newInfo) => {
    console.log("🛩️ SensorPanel.vue 接收到新的飞行信息:", newInfo);
}, { deep: true });
</script>
