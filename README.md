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

模块 说明
components/ 存放所有复用的组件
threejs/ 3D 可视化（无人机模型、飞行轨迹）
charts/ 传感器数据可视化（ECharts）
store/ Vuex 状态管理（WebSocket、传感器数据）
router/ Vue Router 路由管理
utils/ 通用工具函数，如数据格式化
composables/ Vue 3 组合式 API，管理 WebSocket 连接

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
页面 文件路径 功能
主界面 views/Dashboard.vue 3D 画面 + 传感器数据
日志查看 views/Logs.vue 过去飞行数据回放
参数设置 views/Settings.vue 预警阈值调整、模型参数调整

需要完成的事情：2025 年 2 月 13 日

- [x] 1、数据图框的设计与排版改良

- [ ] 2、设置中：阈值有 bug

- [ ] 3、需要将操作记录在 logpannel 文件中，这个文件将显示重要的时间点，在日志的界面中

- [x] 4、在 3d 界面中，对于轨迹需要有清除功能，能正确分辨出一个合理的飞行

- [x] 5、优化模型，找到一个更合适更漂亮的模型

- [x] 6、自动导播有 bug，轨迹观察也会触动自动导播

- [x] 7、主界面中还要有一个 reset 键

- [x] 8、悬浮框改到 3d 界面容器内

- [x] 9、设计一个限制鼠标的内容，现在操作有点复杂，滑动逻辑不好

- [ ] 10、如果可以在前端直接编辑后端的内容就更好了，并且需要合理的直接调用，不是分别运行

- [x] 11、日志与前端联系起来，修改后端脚本，每次传入数据先记录飞机型号（数据集名字记录的信息）然后再日志中更新

- [ ] 12、完成回放功能，
  - [ ] 并且回放功能应当有进度条

