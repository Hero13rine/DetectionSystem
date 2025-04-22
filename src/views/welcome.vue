<template>
    <div class="welcome-container">
        <img src="@/assets/logo1.png" class="logo" />
        <div class="welcome-content">
            <h1>欢迎使用无人机异常检测系统</h1>
            <p>高效 · 智能 · 安全</p>
            <div class="button-group">
                <el-button type="primary" class="fancy-btn" @click="$router.push('/dashboard')">
                    硬件监控系统
                </el-button>
                <el-button plain class="fancy-btn" @click="$router.push('/adsbanomaly')">
                    ADS-B异常检测
                </el-button>
            </div>
        </div>
        <div class="author-signature">计科2102 刘志楷</div>
    </div>

</template>

<script setup>
</script>

<style scoped>
html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    overflow: hidden;
    font-family: "Microsoft YaHei", sans-serif;
}
.logo {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 400px;
    height: auto;
    z-index: 10;
}
.welcome-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    background-image: url("@/assets/bg.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.welcome-content {
    text-align: center;
    color: #fff;
    padding: 40px 60px;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 20px;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
}

h1 {
    font-size: 36px;
    margin-bottom: 10px;
}

p {
    font-size: 18px;
    margin-bottom: 30px;
}

.button-group {
    display: flex;
    justify-content: center;
    gap: 20px;
}

.fancy-btn {
    transition: all 0.3s ease;
}

.fancy-btn:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 8px 20px rgba(255, 255, 255, 0.3);
}
.author-signature {
    position: absolute;
    bottom: 20px;
    right: 20px;
    color: #ffffffcc;
    font-size: 20px;
    font-weight: 300;
    font-family: "Microsoft YaHei", sans-serif;
    background-color: rgba(0, 0, 0, 0.35);
    padding: 6px 12px;
    border-radius: 8px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.3);
}
</style>
