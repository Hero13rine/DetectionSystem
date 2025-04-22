<template>
    <div class="floating-upload">
        <div class="button-wrapper">
            <el-button type="primary" @click="triggerFileSelect">
                导入飞行数据 JSON 文件
            </el-button>
        </div>
        <input ref="fileInput" type="file" accept=".json" style="display: none" @change="onFileChange" multiple />

        <el-divider />
        <div v-if="trackList.length">
            <p style="margin: 6px 0; font-weight: bold;">当前轨迹：</p>
            <div class="track-list">
                <div v-for="(track, index) in trackList" :key="index" class="track-item">
                    {{ track.title }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useStore } from 'vuex'

const store = useStore()
const fileInput = ref(null)
const trackList = ref([])            // 所有导入轨迹
const selectedTracks = ref([])       // 当前选中的轨迹名

function triggerFileSelect() {
    fileInput.value?.click()
}

function onFileChange(event) {
  const files = event.target.files
  const newTrackList = []

  for (const file of files) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        let text = e.target.result
        if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1)
        const parsed = JSON.parse(text)

        const title = parsed?.title || file.name.replace('.json', '')
        newTrackList.push({ title, data: parsed })
          selectedTracks.value.push(title)
        
        if (newTrackList.length === files.length) {
            // ✅ 正确写入 Vuex
            trackList.value = newTrackList   // ✅ 添加这一句！
            selectedTracks.value = newTrackList.map(t => t.title)

          store.commit('adsbTrack/setTracks', newTrackList)
          store.commit('adsbTrack/setSelectedTitles', newTrackList.map(t => t.title))
          console.log('🧠 已写入 store，轨迹数量：', newTrackList.length)
        }

      } catch (err) {
        ElMessage.error(`文件 ${file.name} 格式错误`)
      }
    }
    reader.readAsText(file)
  }
}

</script>

<style scoped>
.floating-upload {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 1000;
    padding: 12px 16px;
    border-radius: 10px;
    backdrop-filter: blur(8px);
    background-color: rgba(255, 255, 255, 0.7);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    max-width: 300px;
}
.button-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
}
</style>