<template>
    <!-- 全屏自动换行平铺所有曲线：ECharts 迷你图 -->
    <div class="grid" v-if="numericHeaders.length">
        <div v-for="h in numericHeaders" :key="h" :id="`chart-${h}`" class="chart"></div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const SAMPLE_STEP = 20
const MAX_POINTS = 500

const numericHeaders = ref([])
const dataDict = ref({})

async function loadData() {
    const resp = await fetch('/demo-data.csv')
    const text = await resp.text()
    const lines = text.trim().split(/\r?\n/)
    const cols = lines[0].split(',')
    const sampled = lines
        .slice(1)
        .filter((_, i) => i % SAMPLE_STEP === 0)
        .slice(0, MAX_POINTS)

    const dict = {}
    cols.forEach(c => (dict[c] = []))
    sampled.forEach(l => {
        const cells = l.split(',')
        cols.forEach((c, i) => {
            const v = parseFloat(cells[i])
            dict[c].push(isFinite(v) ? v : null)
        })
    })

    numericHeaders.value = cols.filter(c => dict[c].some(v => v !== null))
    dataDict.value = dict

    nextTick(renderAllCharts)
}

function renderAllCharts() {
    numericHeaders.value.forEach(key => {
        const dom = document.getElementById(`chart-${key}`)
        if (!dom) return
        const chart = echarts.init(dom)
        const data = dataDict.value[key]

        chart.setOption({
            title: {
                text: key,
                left: 'center',
                textStyle: { fontSize: 12 }
            },
            tooltip: { trigger: 'axis' },
            grid: { left: 40, right: 10, top: 30, bottom: 30 },
            xAxis: {
                type: 'category',
                data: data.map((_, i) => i),
                axisTick: { show: false },
                axisLabel: { fontSize: 10 }
            },
            yAxis: {
                type: 'value',
                splitLine: { show: true },
                axisLabel: { fontSize: 10 }
            },
            series: [
                {
                    type: 'line',
                    data,
                    showSymbol: false,
                    smooth: true,
                    lineStyle: { width: 1.5 }
                }
            ]
        })
    })
}

onMounted(loadData)
</script>

<style scoped>
html,
body {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.grid {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 8px;
    padding: 8px;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: auto;
}

.chart {
    width: 100%;
    height: 220px;
    border: 1px solid #ddd;
}
</style>
  
