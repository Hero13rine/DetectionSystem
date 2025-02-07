<template>
  <div ref="threeContainer" class="three-container"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const threeContainer = ref(null);
let scene, camera, renderer, controls;

// **初始化 Three.js 场景**
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);

  // 创建相机
  const aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
  camera.position.set(0, 5, 10);

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth-470, window.innerHeight-100);
  threeContainer.value.appendChild(renderer.domElement);

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // 添加方向光
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);


 // **添加参考网格（GridHelper）**
  const gridHelper = new THREE.GridHelper(50, 50); // 网格大小：50，分割数：50
  scene.add(gridHelper);

  // **添加坐标轴辅助线（AxesHelper）**
  const axesHelper = new THREE.AxesHelper(5); // 轴长度 5
    scene.add(axesHelper);

    //添加相机控制参数
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 启用阻尼效果（惯性）
  controls.dampingFactor = 0.05; // 阻尼系数
  controls.screenSpacePanning = true; // 禁用屏幕平移
  controls.minDistance = 2; // 限制最近距离
  controls.maxDistance = 50; // 限制最远距离
  controls.maxPolarAngle = Math.PI / 2; // 限制俯视角度
};

// **动画循环**
const animate = () => {
    requestAnimationFrame(animate);
    controls.update(); // **更新 OrbitControls**
    renderer.render(scene, camera);
};
const jetPath = new URL('@/assets/models/jet.fbx', import.meta.url).href;
// **加载 FBX 无人机模型**
const loadModel = () => {
  const loader = new FBXLoader();
  loader.load(jetPath, (fbx) => {
    fbx.scale.set(1, 1, 1);
    fbx.position.set(0, 1, 0); // 将无人机模型放置在原点
    scene.add(fbx);
    airplane = fbx;
  }, undefined, (error) => {
    console.error('Error loading FBX:', error);
  });
};
// **窗口大小变化**
const onWindowResize = () => {
  if (camera && renderer) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
};

// **Vue 生命周期**
onMounted(() => {
    initScene();
  loadModel();
  animate();
  window.addEventListener('resize', onWindowResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
});
</script>

<style scoped>
.three-container {
  width: 100%;
  height: 100%;
}
</style>
