<template>
  <el-container>
    <el-header>系统设置</el-header>

    <el-main>
      <el-card>
        <h3>连接设置</h3>
        <el-form label-width="140px">
          <!-- WebSocket 地址 -->
          <el-form-item label="WebSocket 服务器">
            <el-input v-model="websocketUrl" placeholder="ws://localhost:8765" />
          </el-form-item>

          <!-- 保存设置 -->
          <el-form-item>
            <el-button type="primary" @click="saveSettings">保存设置</el-button>
          </el-form-item>

          <!-- 返回欢迎页 -->
          <el-form-item>
            <el-button @click="goToWelcome">返回欢迎页</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// WebSocket 设置
const websocketUrl = ref(localStorage.getItem('websocketUrl') || 'ws://localhost:8765')

const saveSettings = () => {
  localStorage.setItem('websocketUrl', websocketUrl.value)
  ElMessage.success('WebSocket 地址已保存，刷新页面后生效')
}

const goToWelcome = () => {
  router.push('/')
}
</script>

<style scoped>
.el-container {
  padding: 20px;
}

.el-header {
  font-size: 20px;
  font-weight: bold;
  padding: 12px 0;
}

.el-card {
  max-width: 600px;
  margin: 0 auto;
}
</style>
