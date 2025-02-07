<template>
    <el-card>
        <h3>日志记录</h3>
        <el-table :data="logs">
            <el-table-column prop="timestamp" label="时间"></el-table-column>
            <el-table-column prop="event" label="事件"></el-table-column>
        </el-table>
    </el-card>
</template>

<script setup>
import { ref } from 'vue';

const logs = ref([
    { timestamp: '2024-02-06 10:00:00', event: '系统启动' },
    { timestamp: '2024-02-06 10:05:00', event: '无人机起飞' },
]);
</script>

<style scoped>
.el-card {
    margin-bottom: 10px;
}
</style>
