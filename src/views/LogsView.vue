<template>
  <el-card>
    <h3>飞行日志</h3>
    <el-table :data="logEntries" style="width: 100%">
      <el-table-column prop="timestamp" label="时间" width="180"></el-table-column>
      <el-table-column prop="flight_info.model" label="飞机型号"></el-table-column>
      <el-table-column prop="flight_info.date" label="飞行时间" width="200"></el-table-column>
      <el-table-column prop="operation_class" label="故障状态"></el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="replayFlight(row)">回放</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getLogs } from "@/utils/logStorage";

const logEntries = ref([]);

const replayFlight = (entry) => {
  console.log("🎥 开始回放:", entry.flight_info);
  // **触发 3D 场景回放**
};

onMounted(async () => {
  logEntries.value = await getLogs();
});
</script>
