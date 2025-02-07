<template>
    <el-card>
        <h3>传感器数据</h3>
        <SensorChart />
    </el-card>
</template>

<script setup>
import SensorChart from './SensorChart.vue';
</script>

<style scoped>
.el-card {
    margin-bottom: 10px;
}
</style>
