<template>
    <ADSBMap />
    <JsonUploadFloating />
    <TrackChart /> <!-- ✅ 新增图表模块 -->
</template>

<script setup>
import ADSBMap from '@/components/ADSB/ADSBMap.vue'
import JsonUploadFloating from '@/components/ADSB/JsonUploadFloating.vue'
import TrackChart from '@/components/ADSB/TrackChart.vue'
</script>
