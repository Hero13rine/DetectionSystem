<template>
  <div class="sensor-chart-container">
    <h3>📊 传感器数据曲线
      <el-button type="primary" @click="dialogVisible = true" size="small">⚙️ 设置</el-button>
    </h3>

    <!-- ✅ 设置窗口 -->
    <el-dialog v-model="dialogVisible" title="选择显示的曲线" width="30%">
      <el-checkbox-group v-model="selectedGroups">
        <el-checkbox v-for="group in dataGroups" :key="group.key" :label="group.key">
          {{ group.name }}
        </el-checkbox>
      </el-checkbox-group>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="applySettings">应用</el-button>
      </template>
    </el-dialog>

    <!-- ✅ ECharts 图表 -->
    <div ref="chartRef" class="sensor-chart"></div>
  </div>
</template>

<script setup>
import { defineProps, ref, watch, onMounted, nextTick } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  sensorData: {
    type: Array,
    required: true,
  },
});

const dialogVisible = ref(false);

// ✅ 先显示 position 和 rotation，其他数据放后面
const dataGroups = ref([
  { name: "位置 (position)", key: "position", subKeys: ["x", "y", "z"] },
  { name: "姿态角度 (rotation)", key: "rotation", subKeys: ["x", "y", "z"] }, // ✅ rotation 弧度 -> 角度
  { name: "指令角度 (commanded_rotation)", key: "commanded_rotation", subKeys: ["x", "y", "z"] },
  { name: "测量速度 (measured_velocity)", key: "measured_velocity", subKeys: ["x", "y", "z"] },
  { name: "测量角速度 (measured_angular_velocity)", key: "measured_angular_velocity", subKeys: ["x", "y", "z"] },
]);

// ✅ 选择的曲线，默认全部选中
const selectedGroups = ref(["position", "rotation"]);

const chartRef = ref(null);
let chartInstance = null;

// **初始化 ECharts**
const initChart = () => {
  if (!chartRef.value) return;
  chartInstance = echarts.init(chartRef.value);
  updateChart();
};

// **更新 ECharts 数据**
const updateChart = () => {
  if (!chartInstance || props.sensorData.length === 0) return;

  let series = [];
  let legendData = [];

  dataGroups.value.forEach(group => {
    group.subKeys.forEach(subKey => {
      let jsonKey = `${group.key}.${subKey}`;
      let displayName = `${group.name} ${subKey}`;

      let dataValues = props.sensorData.map(d => getNestedValue(d, jsonKey));

      // ✅ rotation 需要转换为角度
      if (group.key === "rotation") {
        dataValues = dataValues.map(v => (v !== null ? v * (180 / Math.PI) : null)); // 弧度 -> 角度
      }

      series.push({
        name: displayName,
        type: "line",
        data: dataValues,
      });

      legendData.push(displayName);
    });
  });

  // ✅ 生成 ECharts 选项
  const option = {
    title: { text: "传感器数据", left: "center" },
    tooltip: { trigger: "axis" },
    legend: {
      data: legendData,
      bottom: "5%",
      type: "plain", // ✅ 取消滚动动画，减少卡顿
      itemWidth: 15, // ✅ 调整图例大小，减少空间占用
      selected: legendData.reduce((acc, name) => {
        acc[name] = selectedGroups.value.includes(getGroupKeyByName(name));
        return acc;
      }, {}),
    },
    grid: { left: "10%", right: "10%", top: "10%", bottom: "20%" },
    xAxis: { type: "category", data: props.sensorData.map((_, i) => i) },
    yAxis: { type: "value" },
    series: series,
  };

  chartInstance.setOption(option);
};

// **获取 JSON 嵌套值**
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((o, key) => (o && o[key] !== undefined ? o[key] : null), obj);
};

// **获取曲线名称对应的数据分组 key**
const getGroupKeyByName = (name) => {
  for (const group of dataGroups.value) {
    if (name.includes(group.name)) return group.key;
  }
  return "";
};

// **应用用户选择的设置**
const applySettings = () => {
  dialogVisible.value = false;
  updateChart();
};

// **监听数据变化并更新**
watch(() => props.sensorData, updateChart, { deep: true });

onMounted(() => {
  nextTick(() => {
    initChart();
  });
});
</script>

<style scoped>
.sensor-chart-container {
  width: 100%;
  height: 100%;
}

.sensor-chart {
  width: 100%;
  height: 400px;
}
</style>
