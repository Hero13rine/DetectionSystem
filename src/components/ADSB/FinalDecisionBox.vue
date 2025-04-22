<template>
  <div v-if="valid" class="final-card" :class="{ fraud: isFraud }">
    <div class="title">
      最终判断：
      <span :style="{ color: colorMap[predictLabel] }">
        {{ predictLabel }}
      </span>
    </div>
    <div class="true-label">ADS-B类型：{{ trueLabel }}</div>
    <div v-if="isFraud" class="fraud-alert">⚠️ 预测与实际不一致，可能存在欺诈行为</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const selectedTrack = computed(() => {
  const tracks = store.getters['adsbTrack/selectedTracks']
  return tracks.length > 0 ? tracks[0].data : null
})

const title = computed(() => selectedTrack.value?.title || '')

// ✅ 映射规则：数字 → 标签名
const labelMap = {
  2: '商用飞机',
  6: '旅游飞机',
  9: '直升机'
}

const colorMap = {
  '商用飞机': '#377eb8', // 商用
  '旅游飞机': '#e41a1c', // 旅游
  '直升机': '#4daf4a'  // 直升机
}

// ✅ 从 title 中提取数字
const yIndex = computed(() => parseInt(title.value.match(/Y\s*:\s*(\d+)/)?.[1]))
const yHatIndex = computed(() => parseInt(title.value.match(/Ŷ\s*:\s*(\d+)/)?.[1]))

// ✅ 显示标签值
const trueLabel = computed(() => labelMap[yIndex.value])
const predictLabel = computed(() => labelMap[yHatIndex.value])
const isFraud = computed(() => trueLabel.value && predictLabel.value && trueLabel.value !== predictLabel.value)
const valid = computed(() => !!trueLabel.value && !!predictLabel.value)
</script>

<style scoped>
.final-card {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  z-index: 1003;
  text-align: center;
}
.final-card.fraud {
  border: 2px solid #ff4d4f;
}
.title {
  font-size: 18px;
  margin-bottom: 4px;
}
.true-label {
  font-weight: normal;
  font-size: 14px;
}
.fraud-alert {
  color: #d93025;
  margin-top: 6px;
  font-size: 14px;
}
</style>
