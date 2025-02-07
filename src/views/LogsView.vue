<template>
  <el-container>
    <el-header>日志回放</el-header>
    <el-main>
      <el-card>
        <h3>历史飞行日志</h3>
        <el-table :data="logs">
          <el-table-column prop="timestamp" label="时间"></el-table-column>
          <el-table-column prop="event" label="事件"></el-table-column>
        </el-table>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue';

const logs = ref([
  { timestamp: '2024-02-06 10:00:00', event: '系统启动' },
  { timestamp: '2024-02-06 10:05:00', event: '无人机起飞' },
  { timestamp: '2024-02-06 10:10:00', event: 'GPS 信号弱' },
  { timestamp: '2024-02-06 10:15:00', event: '无人机降落' },
]);
</script>

<style scoped>
.el-container {
  padding: 20px;
}
</style>
