<template>
    <div ref="threeContainer" class="three-container"></div>

    <!-- 3D 视角控制 UI -->
    <div class="camera-controls">
        <el-radio-group v-model="cameraMode" @change="updateCameraMode">
            <el-radio-button label="free">自由模式</el-radio-button>
            <el-radio-button label="follow">尾随模式</el-radio-button>
            <el-radio-button label="broadcast">自动导播</el-radio-button>
            <el-radio-button label="track">轨迹观察</el-radio-button>
        </el-radio-group>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, defineExpose } from 'vue';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const threeContainer = ref(null);
let scene, camera, renderer, controls, airplane;
const cameraMode = ref("free"); // 默认自由模式
let autoBroadcastInterval = null; //自动
let trailVertices = []; // 用于记录轨迹点
let trailGeometry, trailMaterial, trailLine; // 用于绘制轨迹的几何体、材质和线条
let smoothFactor = 0.2;  // 平滑移动比例


// **初始化 Three.js 场景**
const initScene = () => {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    // 创建相机
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    // 让相机远离一点，避免视角过近
    camera.position.set(0, 15, 30); // 原 0, 5, 15 -> 调整为 0, 15, 30

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth - 470, window.innerHeight - 100);
    threeContainer.value.appendChild(renderer.domElement);

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);


    // **添加参考网格（GridHelper）**
    const gridHelper = new THREE.GridHelper(100, 100); // 网格大小：50，分割数：50
    scene.add(gridHelper);

    // **添加坐标轴辅助线（AxesHelper）**
    const axesHelper = new THREE.AxesHelper(10); // 轴长度 5
    scene.add(axesHelper);

    // **轨迹设置**
    trailGeometry = new THREE.BufferGeometry();
    trailMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000,
        linewidth: 2,
        depthWrite: false, // 允许轨迹在线条后面仍然可见
        polygonOffset: true,  // 启用偏移
        polygonOffsetFactor: -1,  // 让轨迹稍微“浮起”
        polygonOffsetUnits: -1
    });

    trailLine = new THREE.Line(trailGeometry, trailMaterial);
    scene.add(trailLine);

    //添加相机控制参数
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼效果（惯性）
    controls.dampingFactor = 0.05; // 阻尼系数
    controls.screenSpacePanning = true; // 禁用屏幕平移
    controls.minDistance = 4; // 限制最近距离
    controls.maxDistance = 100; // 限制最远距离
    controls.maxPolarAngle = Math.PI / 2; // 限制俯视角度


    // 默认启用尾随模式
    updateCameraMode("free");
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
        fbx.scale.set(0.5, 0.5, 0.5);
        fbx.position.set(0, 1, 0); // 将无人机模型放置在原点

        fbx.rotation.set(0.2 ,0 , 0);
        //fbx.rotation.set(0, Math.PI / 2, 0);
        //fbx.rotation.set(0, 0, Math.PI / 2);
        scene.add(fbx);
        airplane = fbx;
    }, undefined, (error) => {
        console.error('Error loading FBX:', error);
    });
};

// **更新摄像机模式**
const updateCameraMode = (mode) => {
    if (mode === "follow") {
        console.log("📸 切换到尾随模式");
        //followCamera = true; // 启用摄像机跟随
    } else if (mode === "free") {
        console.log("🎥 切换到自由模式");
        //adtestview();
        //followCamera = false; // 禁用摄像机跟随
    } else if (mode === "broadcast") {
        console.log("📡 启动自动导播模式");
        //followCamera = false;
        startAutoBroadcast();
    } else if (mode === "track") {
        console.log("🔍 轨迹观察模式");
        //followCamera = false;
        //TODO 轨迹观察模式还是会调用自动导播模式
        adjustCameraForTrackView();
    }
};


// **自动导播模式：每 5 秒切换不同视角**
const startAutoBroadcast = () => {
    if (autoBroadcastInterval) clearInterval(autoBroadcastInterval);
    autoBroadcastInterval = setInterval(() => {
        const angles = [
            { x: 20, y: 20, z: 20 },
            { x: -20, y: 10, z: -20 },
            { x: 10, y: 20, z: 0 }
        ];
        const randomAngle = angles[Math.floor(Math.random() * angles.length)];
        camera.position.set(randomAngle.x, randomAngle.y, randomAngle.z);
        camera.lookAt(scene.position);
    }, 5000);
};

// **轨迹观察模式：调整摄像机适应整个飞行轨迹**
const adjustCameraForTrackView = () => {
    if (!airplane) return;
    const boundingBox = new THREE.Box3().setFromObject(airplane);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2));

    camera.position.set(center.x, center.y + cameraDistance, center.z + cameraDistance);
    camera.lookAt(center);
};


// **更新飞机状态**
const updateAirplaneState = ({ position, rotation }) => {
    if (!airplane) return;

    // 初始化未缩放的飞机位置
    //const rawPosition = new THREE.Vector3(position.x * 0.1, position.y * 0.1, position.z * 0.1);

    // 更新飞机位置和旋转（位置乘以0.1）
    airplane.position.set(position.x * 0.1, position.y * 0.1, position.z * 0.1);
    airplane.rotation.set(rotation.x, rotation.y + Math.PI / 2, rotation.z);

    // 添加轨迹点（位置乘以0.1）
    trailVertices.push(position.x * 0.1, position.y * 0.1, position.z * 0.1);


    // 更新轨迹几何体
    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailVertices, 3));
    trailGeometry.needsUpdate = true;

    if (cameraMode.value === "follow") {
        // 计算目标位置（飞机后方）
        const offset = new THREE.Vector3(0, 3, -8); // 摄像机位于飞机后上方
        offset.applyQuaternion(airplane.quaternion); // 让偏移方向跟随飞机旋转

        // 计算目标位置
        const targetPosition = airplane.position.clone().add(offset);

        // 使用 Lerp 平滑移动摄像机
        camera.position.lerp(targetPosition, smoothFactor);

        // 更新 OrbitControls 的目标为飞机的位置
        controls.target.copy(airplane.position);
        controls.update();
    }
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

defineExpose({ updateAirplaneState });
</script>

<style scoped>
.three-container {
    width: 100%;
    height: 100%;
}
.three-container {
    width: 100%;
    height: 100%;
}

.camera-controls {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.5);
    padding: 10px;
    border-radius: 10px;
}
</style>

