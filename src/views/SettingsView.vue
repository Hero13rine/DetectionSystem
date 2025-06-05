<template>
  <el-container>
    <el-header>系统设置</el-header>

    <el-main>
      <!-- WebSocket 连接设置 -->
      <el-card class="box-card">
        <h3>连接设置</h3>
        <el-form label-width="140px">
          <el-form-item label="WebSocket 服务器">
            <el-input v-model="websocketUrl" placeholder="ws://localhost:8765" />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 相机参数设置 -->
      <el-card class="box-card" style="margin-top: 20px;">
        <h3>相机视角设置</h3>
        <el-form label-width="180px" label-position="left">
          <el-form-item label="最大跟随距离">
            <el-slider v-model="maxFollowDistance" :min="1000" :max="100000" :step="1000" show-input />
          </el-form-item>

          <el-form-item label="相机远裁剪面">
            <el-slider v-model="cameraFar" :min="1000" :max="100000" :step="1000" show-input />
          </el-form-item>

          <el-form-item label="相机近裁剪面">
            <el-slider v-model="cameraNear" :min="0.01" :max="10" :step="0.01" show-input />
          </el-form-item>

          <el-form-item label="飞机模型缩放比例">
            <el-slider v-model="airplaneScale" :min="0.1" :max="5" :step="0.1" :precision="2" show-input />
          </el-form-item>

          <el-form-item label="网格线数量">
            <el-slider v-model="gridDivisions" :min="10" :max="200" :step="10" show-input />
          </el-form-item>

          <el-form-item label="地面大小">
            <el-slider v-model="groundSize" :min="0" :max="40000" :step="10" show-input />
          </el-form-item>
        </el-form>
      </el-card>

    </el-main>
  </el-container>
  <el-row type="flex" justify="center" style="margin-top: 30px;">
    <el-col :span="16" style="text-align: center;">
      <el-button type="primary" @click="saveSettings">保存设置</el-button>
      <el-button type="danger" @click="resetDefaults" style="margin-left: 10px;">恢复默认设置</el-button>
      <el-button type="success" @click="goToWelcome" style="margin-left: 10px;">返回欢迎页</el-button>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// ========== 默认值 ==========
const DEFAULT_FOLLOW_DISTANCE = 50000
const DEFAULT_CAMERA_FAR = 10000
const DEFAULT_CAMERA_NEAR = 0.1
const DEFAULT_AIRPLANE_SCALE = 0.5
const DEFAULT_GRID_DIVISIONS = 160
const DEFAULT_GROUND_SIZE = 1000
const DEFAULT_WS_URL = 'ws://localhost:8765'

// ========== ref 定义 ==========
const websocketUrl = ref(localStorage.getItem('websocketUrl') || DEFAULT_WS_URL)
const maxFollowDistance = ref(Number(localStorage.getItem('maxFollowDistance')) || DEFAULT_FOLLOW_DISTANCE)
const cameraFar = ref(Number(localStorage.getItem('cameraFar')) || DEFAULT_CAMERA_FAR)
const cameraNear = ref(Number(localStorage.getItem('cameraNear')) || DEFAULT_CAMERA_NEAR)
const airplaneScale = ref(Number(localStorage.getItem('airplaneScale')) || DEFAULT_AIRPLANE_SCALE)
const gridDivisions = ref(Number(localStorage.getItem('gridDivisions')) || DEFAULT_GRID_DIVISIONS)
const groundSize = ref(Number(localStorage.getItem('groundSize')) || DEFAULT_GROUND_SIZE)

// ========== 保存逻辑 ==========
const saveSettings = () => {
  localStorage.setItem('websocketUrl', websocketUrl.value)
  localStorage.setItem('maxFollowDistance', maxFollowDistance.value)
  localStorage.setItem('cameraFar', cameraFar.value)
  localStorage.setItem('cameraNear', cameraNear.value)
  localStorage.setItem('airplaneScale', airplaneScale.value)
  localStorage.setItem('gridDivisions', gridDivisions.value)
  localStorage.setItem('groundSize', groundSize.value)
}

// ========== 重置默认 ==========
const resetDefaults = () => {
  websocketUrl.value = DEFAULT_WS_URL
  maxFollowDistance.value = DEFAULT_FOLLOW_DISTANCE
  cameraFar.value = DEFAULT_CAMERA_FAR
  airplaneScale.value = DEFAULT_AIRPLANE_SCALE
  gridDivisions.value = DEFAULT_GRID_DIVISIONS
  groundSize.value = DEFAULT_GROUND_SIZE
}

// ========== 页面跳转 ==========
const router = useRouter()
const goToWelcome = () => {
  router.push('/')
}
</script>


<style scoped>
.box-card {
  padding: 20px;
}
</style>
