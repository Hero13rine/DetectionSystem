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
  flightInfo: { // 新增飞行信息 prop
    type: Object,
    required: false,
  },
});

const dialogVisible = ref(false);

// ✅ 默认 **只选中 position 和 rotation**
const selectedGroups = ref(["position", "rotation"]);

// ✅ 先显示 position 和 rotation，其他数据放后面
const dataGroups = ref([
  { name: "位置 (position)", key: "position", subKeys: ["x", "y", "z"] },
  { name: "姿态角度 (rotation)", key: "rotation", subKeys: ["x", "y", "z"] },
  { name: "指令角度 (commanded_rotation)", key: "commanded_rotation", subKeys: ["x", "y", "z"] },
  { name: "测量速度 (measured_velocity)", key: "measured_velocity", subKeys: ["x", "y", "z"] },
  { name: "测量角速度 (measured_angular_velocity)", key: "measured_angular_velocity", subKeys: ["x", "y", "z"] },
]);

// ✅ 定义中文显示名称映射
const displayNameMap = {
  position: "位置",
  rotation: "姿态角度",
  commanded_rotation: "指令角度",
  measured_velocity: "测量速度",
  measured_angular_velocity: "测量角速度",
  x: "X",
  y: "Y",
  z: "Z",
};

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
  let legendData = {};

  dataGroups.value.forEach(group => {
    group.subKeys.forEach(subKey => {
      let jsonKey = `${group.key}.${subKey}`;
      let displayName = `${displayNameMap[group.key]} ${displayNameMap[subKey]}`;

      // ✅ 仅在选中时添加数据，否则设为空
      let dataValues = selectedGroups.value.includes(group.key)
        ? props.sensorData.map(d => getNestedValue(d, jsonKey))
        : [];

      // ✅ rotation 需要转换为角度
      if (group.key === "rotation" && dataValues.length > 0) {
        dataValues = dataValues.map(v => (v !== null ? v * (180 / Math.PI) : null));
      }

      series.push({
        name: displayName,
        type: "line",
        data: dataValues,
      });

      legendData[displayName] = selectedGroups.value.includes(group.key);
    });
  });

  // ✅ 让 ECharts 识别并正确隐藏未选中曲线
  const option = {
    title: { text: "传感器数据", left: "center" },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        return params.map(p => `${p.seriesName}: ${p.value.toFixed(2)}`).join("<br>");
      },
    },
    axisPointer: {
      type: "line",
      label: { show: true },
    },
    legend: {
      data: Object.keys(legendData),
      bottom: "1%",
      type: "scroll",
      itemWidth: 10,
      animation: false, // ✅ 彻底关闭动画
      animationDurationUpdate: 0, // ✅ 取消更新动画
      animationEasingUpdate: "linear", // ✅ 取消缓动
      pageIconSize: 10,
      pageButtonGap: 0, // ✅ 防止翻页按钮闪烁
      selected: legendData, // ✅ 让 ECharts 正确管理显示/隐藏
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

// **应用用户选择的设置**
const applySettings = () => {
  dialogVisible.value = false;
  updateChart();
};

// **监听数据变化并更新**
watch(() => props.sensorData, updateChart, { deep: true });

// ✅ 监听 flightInfo 变化，清空图表数据
watch(() => props.flightInfo, (newVal, oldVal) => {
  if (chartInstance && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
    // 清空图表
    
    chartInstance.clear();
  }
});

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
