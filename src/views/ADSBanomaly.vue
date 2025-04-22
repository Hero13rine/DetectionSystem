<template>
    <ADSBMap />
    <JsonUploadFloating />
    <TrackChart /> <!-- ✅ 新增图表模块 -->
    <FinalDecisionBox />
    <router-link to="/" class="back-home-btn" title="返回首页">
        ⬅
    </router-link>
</template>

<script setup>
import ADSBMap from '@/components/ADSB/ADSBMap.vue'
import JsonUploadFloating from '@/components/ADSB/JsonUploadFloating.vue'
import TrackChart from '@/components/ADSB/TrackChart.vue'
import FinalDecisionBox from '@/components/ADSB/FinalDecisionBox.vue'

</script>
<style scoped>
.back-home-btn {
    position: absolute;
    top: 16px;
    left: 16px;
    font-size: 22px;
    padding: 6px 10px;
    border-radius: 6px;
    text-decoration: none;
    color: #aaa;
    background: rgba(255, 255, 255, 0.1);
    z-index: 1200;
    transition: all 0.2s;
}

.back-home-btn:hover {
    color: black;
    background: rgba(255, 255, 255, 0.85);
    font-weight: bold;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}
</style>