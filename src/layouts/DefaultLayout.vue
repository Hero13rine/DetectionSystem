<template>
    <el-container>
            <el-container>
            <!-- 左侧3D可视化区域 -->
            <el-main class="main-content">
                <Drone3D />
            </el-main>

            <!-- 右侧数据监视和告警 -->
            <el-aside width="350px" class="side-panel">
                <SensorPanel />
                <AlertPanel />
            </el-aside>
        </el-container>

        <!-- 底部日志面板 -->
        <el-footer>
            <LogsPanel />
        </el-footer>
    </el-container>
</template>

<script setup>
import Drone3D from '@/components/threejs/Drone3D.vue';
import SensorPanel from '@/components/charts/SensorPanel.vue';
import AlertPanel from '@/components/ui/AlertPanel.vue';
import LogsPanel from '@/components/ui/LogsPanel.vue';
</script>

<style scoped>
.main-content {
    height: calc(100vh - 120px);
    /* 除去 header 和 footer 的高度 */
}

.side-panel {
    background: #f5f5f5;
    padding: 10px;
}

.el-footer {
    background: #ddd;
    text-align: center;
    padding: 10px;
}
</style>
