import { debounce } from "lodash";

const _ = (window as any).ResizeObserver;
(window as any).ResizeObserver = class ResizeObserver extends _ {
  constructor(callback: (...args: any[]) => void) {
    callback = debounce(callback, 100);
    super(callback);
  }
};

<template>
  <el-container>
    <!-- 顶部导航 -->
    <el-header class="app-header">
      <!-- 设置 el-menu 的样式，确保所有菜单项可见 -->
      <el-menu mode="horizontal" router style="flex-grow: 1; overflow-x: auto;">
        <el-menu-item index="">
          <router-link to="/">
            实时监控
          </router-link>
        </el-menu-item>
        <el-menu-item index="/logs">
          <router-link to="/logs">
            数据回放
          </router-link>
        </el-menu-item>
        <el-menu-item index="/settings">
          <router-link to="/settings">
            系统设置
          </router-link>
        </el-menu-item>
      </el-menu>
    </el-header>

    <!-- 主体部分：路由视图 -->
    <!-- 主体部分 -->
    <el-main>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive" />
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive" />
    </el-main>
  </el-container>
</template>

<script setup>
//import { useWebSocket } from "@/composables/useWebSocket";
//import { saveLog } from "@/utils/logStorage";

// const { flightInfo } =  useWebSocket("ws://localhost:8765", async (newData) => {
  
//   await saveLog({ flightInfo: flightInfo.value, sensor_data: newData });  // **直接存入数据库**
// });

</script>


<style scoped>
/* 头部样式 */
.app-header {
  background-color: #005db9;
  color: rgb(255, 255, 255);
  display: flex;
  align-items: center;
  padding: 0;
}

/* 链接样式 */
a {
  text-decoration: none;
  color: white;
}

a:hover {
  color: #f39c12;
}
.el-menu {
  width: 100%; /* 确保 el-menu 占满整个 header */
}

.el-menu-item {
  white-space: nowrap; /* 防止菜单项换行 */
}
</style>



