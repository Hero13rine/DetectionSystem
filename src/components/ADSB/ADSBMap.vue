<template>
    <div id="leaflet-map" ref="mapContainer"></div>
    <div class="legend-box">
        <div class="legend-title">预测类型图例</div>
        <div v-for="(label, key) in legendItems" :key="key" class="legend-item"
            :class="{ active: activeTypes.includes(key) }" @click="toggleType(key)">
            <span class="color-box" :style="{ backgroundColor: label.color }"></span>
            {{ label.name }}
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useStore } from 'vuex'

const store = useStore()
const selectedTracks = computed(() => store.getters['adsbTrack/selectedTracks'])
const selectedTitles = computed(() => store.state.adsbTrack.selectedTitles)

const mapContainer = ref(null)
let mapInstance = null
const trackLayerMap = {} // title => [polylines]

const colorMap = {
    'Tourism Plane': '#e41a1c',
    'Commercial Plane': '#377eb8',
    'Helicopter': '#4daf4a'
}

const legendItems = {
    'Tourism Plane': { name: '旅游飞机', color: colorMap['Tourism Plane'] },
    'Commercial Plane': { name: '商用飞机', color: colorMap['Commercial Plane'] },
    'Helicopter': { name: '直升机', color: colorMap['Helicopter'] }
}


const activeTypes = ref(Object.keys(legendItems))
function toggleType(type) {
    if (activeTypes.value.includes(type)) {
        activeTypes.value = activeTypes.value.filter(t => t !== type)
    } else {
        activeTypes.value.push(type)
    }
    redrawTracks() // 触发重新渲染
}

onMounted(() => {
    mapInstance = L.map(mapContainer.value, {
        center: [43.59, 1.46],
        zoom: 11,
        zoomDelta: 0.25,
        wheelPxPerZoomLevel: 264,
        keyboard: false,
        preferCanvas: true
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapInstance)
})

watch(selectedTracks, () => {
    redrawTracks()
})

function redrawTracks() {
    // 清空地图上的旧图层
    Object.values(trackLayerMap).flat().forEach(layer => mapInstance.removeLayer(layer))

    const allLatLng = []  // ✅ 收集所有轨迹坐标，用于 fitBounds()

    selectedTracks.value.forEach(track => {
        const title = track.title
        const jsonData = track.data

        const lat = jsonData.features.latitude
        const lon = jsonData.features.longitude
        const labels = jsonData.prediction.predicted_labels_name
        const probabilities = jsonData.prediction.probabilities

        // ✅ 提前缓存特征字段
        const groundspeed = jsonData.features.groundspeed || []
        const trackDeg = jsonData.features.track || []
        const verticalRate = jsonData.features.vertical_rate || []
        const altitude = jsonData.features.altitude || []
        const geoaltitude = jsonData.features.geoaltitude || []

        if (!lat || !lon || lat.length < 2 || lon.length !== lat.length || !labels) return

        // 划分段
        const segments = []
        let currentLabel = labels[0]
        let currentSegment = [[lat[0], lon[0]]]
        let startIndex = 0

        for (let i = 1; i < lat.length; i++) {
            const coord = [lat[i], lon[i]]
            if (labels[i] === currentLabel) {
                currentSegment.push(coord)
            } else {
                if (currentSegment.length > 1) {
                    segments.push({ label: currentLabel, coords: [...currentSegment], start: startIndex })
                }
                currentLabel = labels[i]
                currentSegment = [coord]
                startIndex = i
            }
        }
        if (currentSegment.length > 1) {
            segments.push({ label: currentLabel, coords: currentSegment, start: startIndex })
        }

        const layers = []
        segments.forEach((seg) => {
            if (!activeTypes.value.includes(seg.label)) return

            const labelIndex = {
                'Commercial Plane': 0,
                'Tourism Plane': 1,
                'Helicopter': 2
            }[seg.label] ?? 0

            const polyline = L.polyline(seg.coords, {
                color: colorMap[seg.label] || '#888',
                weight: 4,
                opacity: 1
            }).addTo(mapInstance)

            // 收集轨迹点用于地图聚焦
            allLatLng.push(...seg.coords)

            // 构造 tooltip 内容（点详细信息）
            const tooltipContent = `
        <strong>预测机型：</strong> ${legendItems[seg.label]?.name || seg.label}<br/>
        <strong>段内点信息：</strong><br/>
        ${seg.coords.map((coord, i) => {
                const globalIndex = seg.start + i
                const prob = probabilities?.[globalIndex]?.[labelIndex] ?? 0

                const gs = groundspeed?.[globalIndex]
                const heading = trackDeg?.[globalIndex]
                const vr = verticalRate?.[globalIndex]
                const alt = altitude?.[globalIndex]
                const geoalt = geoaltitude?.[globalIndex]

                return `
            #${i + 1}｜经度: ${coord[1].toFixed(8)}｜纬度: ${coord[0].toFixed(8)}<br/>
            地速: ${gs?.toFixed(2) ?? '无'} kt，
            航向: ${heading?.toFixed(2) ?? '无'}°，
            垂直速率: ${vr?.toFixed(2) ?? '无'} m/s<br/>
            高度: ${alt?.toFixed(0) ?? '无'} ft，
            地理高度: ${geoalt?.toFixed(0) ?? '无'} ft，
            置信度: ${prob.toFixed(2)}<br/>
          `
            }).join('<hr style="margin: 4px 0;"/>')}
      `

            polyline.bindTooltip(tooltipContent, { sticky: true })
            layers.push(polyline)
        })

        trackLayerMap[title] = layers
    })

    // ✅ 自动聚焦地图到所有轨迹点
    if (allLatLng.length > 0) {
        mapInstance.fitBounds(allLatLng)
    }
}


</script>

<style scoped>
#leaflet-map {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 0;
}

.legend-box {
    position: absolute;
    bottom: 20px;
    left: 20px;
    background: rgba(255, 255, 255, 0.85);
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1001;
    user-select: none;
    cursor: pointer;
}

.legend-title {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 14px;
}

.legend-item {
    display: flex;
    align-items: center;
    margin: 4px 0;
    transition: all 0.2s;
    opacity: 0.8;
}

.legend-item.active {
    font-weight: bold;
    opacity: 1;
}

.color-box {
    display: inline-block;
    width: 12px;
    height: 12px;
    margin-right: 8px;
    border-radius: 2px;
}
</style>