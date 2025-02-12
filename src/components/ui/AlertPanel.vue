<template>
  <el-card>
    <h3>故障预警</h3>

    <el-alert v-if="operationClass !== 'normal'" type="error" show-icon>
      当前故障：{{ operationClass }}
    </el-alert>

    <el-alert v-else type="success" show-icon>
      无
    </el-alert>
  </el-card>
</template>

<script setup>
import { defineProps } from 'vue';

// **从父组件接收 operationClass**
defineProps({
  operationClass: {
    type: String,
    default: "normal"
  }
});
</script>

<style scoped>
.el-card {
  margin-bottom: 10px;
}
</style>
