<template>
    <ADSBMap />
    <JsonUploadFloating />
    <TrackChart /> <!-- ✅ 新增图表模块 -->
    <FinalDecisionBox />
</template>

<script setup>
import ADSBMap from '@/components/ADSB/ADSBMap.vue'
import JsonUploadFloating from '@/components/ADSB/JsonUploadFloating.vue'
import TrackChart from '@/components/ADSB/TrackChart.vue'
import FinalDecisionBox from '@/components/ADSB/FinalDecisionBox.vue'

</script>
