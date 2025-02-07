<template>
  <el-container>
    <el-main>
      <Drone3D />
    </el-main>
    <el-aside width="350px">
      <SensorPanel />
      <AlertPanel />
    </el-aside>
  </el-container>

    <el-footer>
      <LogsPanel />
    </el-footer>
</template>
<script setup>
//import { ref } from 'vue';
import Drone3D from '@/components/threejs/Drone3D.vue';
import SensorPanel from '@/components/charts/SensorPanel.vue';
import AlertPanel from '@/components/ui/AlertPanel.vue';
import LogsPanel from '@/components/ui/LogsPanel.vue';


</script>
