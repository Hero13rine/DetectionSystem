# detection-system

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


 模块	说明
components/	存放所有复用的组件
threejs/	3D 可视化（无人机模型、飞行轨迹）
charts/	传感器数据可视化（ECharts）
store/	Vuex 状态管理（WebSocket、传感器数据）
router/	Vue Router 路由管理
utils/	通用工具函数，如数据格式化
composables/	Vue 3 组合式 API，管理 WebSocket 连接


3.1 3D 可视化模块
目录：src/components/threejs/Drone3D.vue

使用 Three.js 渲染无人机模型
通过 WebSocket 获取姿态数据
显示飞行轨迹
3.2 数据监控模块
目录：src/components/charts/SensorChart.vue

采用 ECharts 可视化传感器数据
支持多种数据曲线（速度、高度、角度等）
3.3 WebSocket 通信模块
目录：src/composables/useWebSocket.js

负责 WebSocket 连接
监听实时数据，并更新 Vuex 状态 
3.4 Vuex 状态管理
目录：src/store/index.js

3.5 页面划分
页面	文件路径	功能
主界面	views/Dashboard.vue	3D 画面 + 传感器数据
日志查看	views/Logs.vue	过去飞行数据回放
参数设置	views/Settings.vue	预警阈值调整、模型参数调整
    