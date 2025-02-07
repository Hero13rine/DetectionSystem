<template>
  <div ref="chartRef" style="width: 100%; height: 300px;"></div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

const chartRef = ref(null);

onMounted(() => {
  const chart = echarts.init(chartRef.value);
  const option = {
    title: { text: '传感器数据' },
    xAxis: { type: 'category', data: ['1s', '2s', '3s', '4s', '5s'] },
    yAxis: { type: 'value' },
    series: [{ name: '温度', type: 'line', data: [22, 23, 21, 25, 24] }],
  };
  chart.setOption(option);
});
</script>

<style scoped>
div {
  border: 1px solid #ddd;
  border-radius: 5px;
}
</style>
