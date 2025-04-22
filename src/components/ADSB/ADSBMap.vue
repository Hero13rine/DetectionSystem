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
    L.control.scale({ imperial: false }).addTo(mapInstance)
})

watch(selectedTracks, () => {
    redrawTracks()
})

function redrawTracks() {
    Object.values(trackLayerMap).flat().forEach(layer => mapInstance.removeLayer(layer))

    const allLatLngBounds = [] // ✅ 存放所有路径点，用于后续 fitBounds

    selectedTracks.value.forEach(track => {
        const title = track.title
        const jsonData = track.data
        const lat = jsonData.features.latitude
        const lon = jsonData.features.longitude
        const labels = jsonData.prediction.predicted_labels_name
        const probabilities = jsonData.prediction.probabilities

        const groundspeed = jsonData.features.groundspeed || []
        const trackDeg = jsonData.features.track || []
        const verticalRate = jsonData.features.vertical_rate || []
        const altitude = jsonData.features.altitude || []
        const geoaltitude = jsonData.features.geoaltitude || []

        if (!lat || !lon || lat.length < 2 || lon.length !== lat.length || !labels) return

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
        let fullCoords = [] // ✅ 全部轨迹点（用于标记首尾）

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
            layers.push(polyline)

            allLatLngBounds.push(...seg.coords)
            fullCoords.push(...seg.coords)

            seg.coords.forEach((coord, i) => {
                const globalIndex = seg.start + i
                const prob = probabilities?.[globalIndex]?.[labelIndex] ?? 0

                const tooltipContent = `
                    <strong>预测机型：</strong> ${legendItems[seg.label]?.name || seg.label}<br/>
                    <strong>经度：</strong> ${coord[1].toFixed(8)}<br/>
                    <strong>纬度：</strong> ${coord[0].toFixed(8)}<br/>
                    <strong>地速：</strong> ${groundspeed?.[globalIndex]?.toFixed(2)} kt<br/>
                    <strong>航向：</strong> ${trackDeg?.[globalIndex]?.toFixed(2)}°<br/>
                    <strong>垂直速率：</strong> ${verticalRate?.[globalIndex]?.toFixed(2)} m/s<br/>
                    <strong>高度：</strong> ${altitude?.[globalIndex]?.toFixed(0)} ft<br/>
                    <strong>地理高度：</strong> ${geoaltitude?.[globalIndex]?.toFixed(0)} ft<br/>
                    <strong>置信度：</strong> ${prob.toFixed(2)}
                `

                const marker = L.circleMarker(coord, {
                    radius: 1,
                    color: colorMap[seg.label] || '#888',
                    weight: 1,
                    fillOpacity: 0.9
                }).bindTooltip(tooltipContent, { sticky: true }).addTo(mapInstance)

                layers.push(marker)
            })
        })

        // ✅ 仅标记整条 track 的起点和终点
        if (fullCoords.length >= 2) {
            const startMarker = L.circleMarker(fullCoords[0], {
                radius: 5,
                color: '#007bff',
                fillColor: '#007bff',
                weight: 2,
                fillOpacity: 1
            }).bindTooltip('起点', { permanent: true, direction: 'right' }).addTo(mapInstance)
            layers.push(startMarker)

            const endMarker = L.circleMarker(fullCoords[fullCoords.length - 1], {
                radius: 5,
                color: '#ff0000',
                fillColor: '#ff0000',
                weight: 2,
                fillOpacity: 1
            }).bindTooltip('终点', { permanent: true, direction: 'right' }).addTo(mapInstance)
            layers.push(endMarker)
        }

        trackLayerMap[title] = layers
    })

    // ✅ 自动聚焦到所有轨迹坐标点范围
    if (allLatLngBounds.length > 0) {
        const bounds = L.latLngBounds(allLatLngBounds)
        mapInstance.fitBounds(bounds, { padding: [40, 40] })
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
    top: 20px;
    left: 60px;
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