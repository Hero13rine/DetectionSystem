<template>
  <el-container>
    <el-header>系统设置</el-header>
    <el-main>
      <el-card>
        <h3>参数设置</h3>
        <el-form label-width="120px">
          <el-form-item label="WebSocket 服务器">
            <el-input v-model="websocketUrl" placeholder="ws://localhost:8765"></el-input>
          </el-form-item>
          <el-form-item label="故障预警阈值">
            <el-slider v-model="threshold" :min="0" :max="100"></el-slider>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue';

const websocketUrl = ref(localStorage.getItem('websocketUrl') || 'ws://localhost:8765');
const threshold = ref(localStorage.getItem('threshold') || 50);

const saveSettings = () => {
  localStorage.setItem('websocketUrl', websocketUrl.value);
  localStorage.setItem('threshold', threshold.value);
  location.reload(); // **刷新页面，让 WebSocket 重新连接**
};
</script>

<style scoped>
.el-container {
  padding: 20px;
}
</style>
