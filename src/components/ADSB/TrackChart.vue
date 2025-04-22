<template>
  <div class="chart-panel">
    <el-select v-model="selectedField" class="selector" size="small" placeholder="选择展示字段">
      <el-option
        v-for="(label, key) in availableFields"
        :key="key"
        :label="label"
        :value="key"
      />
    </el-select>
    <div ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import * as echarts from 'echarts'

const store = useStore()

const selectedTrack = computed(() => {
  const list = store.getters['adsbTrack/selectedTracks']
  return list.length > 0 ? list[0] : null
})

const baseFields = {
  latitude: '纬度 (°)',
  longitude: '经度 (°)',
  groundspeed: '地速 (kt)',
  track: '航向角 (°)',
  vertical_rate: '垂直速率 (m/s)',
  altitude: '高度 (ft)',
  geoaltitude: '地理高度 (ft)',
  confidence: '置信度'
}

const availableFields = ref({ ...baseFields })
const selectedField = ref('altitude')
const chartRef = ref(null)
let chartInstance = null

const colorMap = {
  'Tourism Plane': '#e41a1c',
  'Commercial Plane': '#377eb8',
  'Helicopter': '#4daf4a'
}

function renderChart(track) {
  if (!chartInstance || !track) return

  const features = track.data.features || {}
  const prediction = track.data.prediction || {}
  const additional = track.data.additional || []
  const labels = prediction.predicted_labels_name || []

  const extended = { ...baseFields }
  additional.forEach(item => {
    extended[item.name] = item.name
  })
  availableFields.value = extended

  const field = selectedField.value
  let fullData = []

  if (field === 'confidence') {
    fullData = prediction.confidence || []
  } else if (features[field]) {
    fullData = features[field]
  } else {
    const found = additional.find(a => a.name === field)
    fullData = found?.values || []
  }

  if (!fullData.length || !labels.length) return

  // 1️⃣ 分段处理
  const segments = []
  let currentLabel = labels[0]
  let currentSegment = [{ x: 0, y: fullData[0] }]

  for (let i = 1; i < fullData.length; i++) {
    if (labels[i] === currentLabel) {
      currentSegment.push({ x: i, y: fullData[i] })
    } else {
      segments.push({ label: currentLabel, data: [...currentSegment] })
      currentLabel = labels[i]
      currentSegment = [{ x: i, y: fullData[i] }]
    }
  }
  if (currentSegment.length > 0) {
    segments.push({ label: currentLabel, data: currentSegment })
  }

  // 2️⃣ 横线：置信度 Top20
  let markLineOption = null
  if (field === 'confidence') {
    const sorted = [...fullData].filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => b - a)
    const threshold = sorted[19] ?? null
    if (threshold !== null) {
      markLineOption = {
        silent: true,
        lineStyle: {
          color: '#ffa500',
          type: 'dashed'
        },
        label: {
          formatter: `Top 20 阈值：${threshold.toFixed(2)}`,
          position: 'end'
        },
        data: [
          { yAxis: threshold }
        ]
      }
    }
  }

  // 3️⃣ Series 多段分色
  const series = segments.map(seg => {
    const color = colorMap[seg.label] || '#999'
    return {
      name: seg.label,
      type: 'line',
      showSymbol: false,
      data: seg.data.map(p => [p.x, p.y]),
      lineStyle: {
        color,
        width: 2
      },
      itemStyle: {
        color
      },
      ...(markLineOption ? { markLine: markLineOption } : {})
    }
  })

  // 4️⃣ 渲染图表
  const option = {
    title: {
      text: availableFields.value[field] || field,
      left: 'center',
      top: 6,
      textStyle: { fontSize: 13 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function (params) {
        const fieldName = availableFields.value[field] || field
        let result = `<div style="font-weight: bold; margin-bottom: 4px;">${fieldName}</div>`

        params.forEach(p => {
          const color = p.color
          const label = p.seriesName
          const rawVal = p.value[1] !== undefined ? p.value[1] : p.value
          const valText = (typeof rawVal === 'number' && !isNaN(rawVal))
            ? rawVal.toFixed(4)
            : '无效值'

          result += `
            <div style="margin-bottom: 2px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px;"></span>
              ${label}：${valText}
            </div>`
        })

        return result
      }
    },
    legend: { top: 32 },
    xAxis: {
      type: 'category',
      name: '时间点',
      boundaryGap: false
    },
    yAxis: { type: 'value' },
    series
  }

  chartInstance.setOption(option, true)
}

onMounted(() => {
  chartInstance = echarts.init(chartRef.value)
  if (selectedTrack.value) renderChart(selectedTrack.value)
})

watch([selectedTrack, selectedField], () => {
  renderChart(selectedTrack.value)
})
</script>

<style scoped>
.chart-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 420px;
  height: 260px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 10px 12px;
  z-index: 1001;
  display: flex;
  flex-direction: column;
}

.selector {
  margin-bottom: 6px;
  width: 100%;
}

.chart-container {
  flex: 1;
  width: 100%;
}
</style>
