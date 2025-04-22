<template>
    <el-card class="logs-container">
        <h3>飞行日志</h3>

        <ul class="log-list">
            <li v-for="(log, index) in logs" :key="index">
                <span class="time">{{ log.time }}</span>
                <span class="message">{{ log.message }}</span>
            </li>
        </ul>

        <el-alert v-if="logs.length === 0" type="info" show-icon>
            目前暂无飞行日志
        </el-alert>
    </el-card>
</template>

<script setup>
import { defineProps, ref, watch, onUnmounted } from "vue";

const props = defineProps({
    flightInfo: Object, // 🛫 记录飞机起飞信息
    operationClass: {
        type: String,
        default: "正常", // 默认正常状态
    },
});

const logs = ref([]);

// **监听 `flightInfo` 变化，记录起飞信息**
watch(() => props.flightInfo, (newInfo) => {
    if (newInfo) {
        logs.value.unshift({
            time: new Date().toLocaleTimeString(),
            message: `🚀 飞机 ${newInfo.model} 起飞，时间：${newInfo.date}`,
        });
    }
});

// **监听 `operationClass` 变化，记录故障，并触发炫酷边框**
watch(() => props.operationClass, (newStatus, oldStatus) => {
    if (!newStatus || newStatus === oldStatus) return; // 避免重复日志

    logs.value.unshift({
        time: new Date().toLocaleTimeString(),
        message: getOperationClassMessage(newStatus),
    });

    // 🚨 **开启高端霓虹边框**
    if (newStatus !== "正常") {
        document.body.classList.add("high-end-alert-border");
    } else {
        document.body.classList.remove("high-end-alert-border");
    }
});

// 🚀 **转换 `operationClass` 为可读日志**
const getOperationClassMessage = (operationClass) => {
    switch (operationClass) {
        case "engine fault":
            return "🚨 发动机故障";
        case "left aileron fault":
            return "⚠️ 左副翼故障";
        case "right aileron fault":
            return "⚠️ 右副翼故障";
        case "rudder fault":
            return "🚨 方向舵故障";
        case "elevator fault":
            return "🚨 升降舵故障";
        default:
            return "ℹ️ 状态更新：" + operationClass;
    }
};

// **组件卸载时，确保清除红框**
onUnmounted(() => {
    document.body.classList.remove("high-end-alert-border");
});
</script>

<style scoped>
.logs-container {
    position: relative;
    padding: 15px;
    border-radius: 8px;
}

.logs-container {
    height: 100%;
    /* 让 el-card 撑满 logs-bar */
    box-sizing: border-box;
}

.log-list {
    height: 100%;
    overflow-y: auto;
    /* ✅ 多条日志可滚动 */
    margin: 0;
    padding: 0;
    list-style: none;
}

.time {
    color: #888;
    margin-right: 10px;
}

.message {
    color: #333;
}
</style>

<!-- 🌟🚀 **超高端霓虹红框** 🚀🌟 -->
<style>
@import url("https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css");

/* **炫酷霓虹灯边框动画** */
@keyframes neon-glow {
    0% {
        box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
    }

    50% {
        box-shadow: 0 0 60px rgba(255, 0, 0, 1), inset 0 0 100px rgba(255, 0, 0, 0.8);
    }

    100% {
        box-shadow: 0 0 30px rgba(255, 0, 0, 0.8);
    }
}

/* 🚨 **霓虹灯红框，主体 1px，光晕更大** 🚨 */
.high-end-alert-border::before {
    content: "⚠️";
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: right;
    pointer-events: none;
    animation: neon-glow 1.6s infinite alternate ease-in-out;
    /* 添加放大动画 */
    z-index: 9999;
    font-size: 48px;
}
</style>
