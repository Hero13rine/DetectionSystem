<template>
  <el-card>
    <h3>故障预警</h3>
    
    <!-- 使用外层 template 包裹 v-if 和 v-for -->
    <template v-if="alerts.length > 0">
      <el-alert 
        v-for="(alert, index) in alerts" 
        :key="index" 
        type="error" 
        show-icon
      >
        {{ alert.message }}
      </el-alert>
    </template>

    <!-- v-else 移动到外层 -->
    <el-alert v-else type="success" show-icon>
      系统正常运行
    </el-alert>
  </el-card>
</template>

<script setup>
import { ref } from 'vue';

const alerts = ref([{ message: '姿态异常：偏航角超出正常范围！' }]);
</script>

<style scoped>
.el-card {
    margin-bottom: 10px;
}
</style>
