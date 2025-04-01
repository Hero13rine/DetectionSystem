<template>
  <el-card>
    <h3>📂 飞行数据记录</h3>

    <el-table v-loading="loading" element-loading-text="日志加载中..." element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.8)" :data="logEntries" style="width: 100%; margin-top: 16px">
      <el-table-column prop="flight_info.model" label="飞机型号" />
      <el-table-column prop="flight_info.date" label="飞行时间" width="200" />
      <el-table-column prop="flight_info.failure" label="故障类型" />
      <el-table-column prop="sensor_data_count" label="数据点数" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="replayFlight(row)">回放</el-button>
          <el-button type="success" size="small" @click="viewSensorData(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 传感器数据查看弹窗 -->
  <el-dialog v-model="dialogVisible" title="传感器数据详情" width="1500px" :close-on-click-modal="false">
    <el-table v-if="selectedLog" :data="selectedLog.sensor_data" style="width: 100%; height: 600px" max-height="600px"
      stripe border>
      <el-table-column v-for="key in sensorDataKeys" :key="key" :prop="key" :label="key">
        <template #default="{ row }">
          <pre>{{ formatNestedData(row[key]) }}</pre>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getLogs, getLog } from '@/utils/logStorage'

const router = useRouter()
const store = useStore()

const logEntries = ref([])
const dialogVisible = ref(false)
const selectedLog = ref(null)
const loading = ref(true)

// 加载日志
const loadLogs = async () => {
  loading.value = true
  const logs = await getLogs()

  logEntries.value = logs.map(log => ({
    flight_info: log.flightInfo,
    sensor_data: log.sensor_data || [],
    sensor_data_count: log.sensor_data ? log.sensor_data.length : 0
  }))

  loading.value = false
  console.log("📂 日志加载成功:", logEntries.value)
}

// 回放功能
const replayFlight = async (row) => {
  const flightInfo = row.flight_info
  const flight_id = `${flightInfo.model}_${flightInfo.date}${flightInfo.segment ? `_${flightInfo.segment}` : ''}`

  const log = await getLog(flight_id)
  if (!log || !log.sensor_data?.length) {
    console.warn("⚠️ 未找到日志数据")
    return
  }

  store.dispatch('replay/loadReplayData', log.sensor_data)
  router.push('/')
}

// 弹窗查看数据
const viewSensorData = (entry) => {
  selectedLog.value = entry
  dialogVisible.value = true
}

// 动态表头
const sensorDataKeys = computed(() => {
  if (selectedLog.value && selectedLog.value.sensor_data.length > 0) {
    return Object.keys(selectedLog.value.sensor_data[0])
  }
  return []
})

// 格式化嵌套对象
const formatNestedData = (data) => {
  return typeof data === 'object' ? JSON.stringify(data, null, 2) : data
}

onMounted(loadLogs)
</script>

<style scoped>
.el-dialog {
  max-height: 80vh;
  overflow-y: auto;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 12px;
  background: #f8f8f8;
  padding: 4px;
  border-radius: 4px;
}
</style>
