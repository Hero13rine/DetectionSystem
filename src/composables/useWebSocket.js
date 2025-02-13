import { ref, onMounted, onUnmounted } from "vue";

export function useWebSocket(url, onMessageCallback) {
  const socket = ref(null);
  const isConnected = ref(false);
  const flightInfo = ref(null); // 当前飞行信息
  const sensorData = ref([]); // 传感器数据队列
  const maxQueueSize = 100; // 最大数据队列长度
  const status = ref("normal"); // 当前飞行状态

  // 初始化 WebSocket 连接
  const connect = () => {
    socket.value = new WebSocket(url);

    socket.value.onopen = () => {
      isConnected.value = true;
      console.log("✅ WebSocket 连接成功");
    };

    socket.value.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 更新飞行信息
        if (data.flight_info && !flightInfo.value) {
          flightInfo.value = data.flight_info;
          console.log("📄 收到飞行信息:", flightInfo.value);
        }

        // 更新传感器数据
        if (data.sensor_data) {
          const latestData = data.sensor_data;
          sensorData.value.push(latestData);

          // 保持队列长度
          if (sensorData.value.length > maxQueueSize) {
            sensorData.value.shift();
          }

          // 更新飞行状态
          if (latestData.operation_class !== status.value) {
            status.value = latestData.operation_class;
            console.log("🚩 飞行状态更新:", status.value);
          }

          // **回调函数通知组件新数据**
          if (onMessageCallback) {
            onMessageCallback(latestData);
          }
        }

        console.log("📥 收到传感器数据:", data.sensor_data);
      } catch (error) {
        console.error("❌ 消息解析失败:", error);
      }
    };

    socket.value.onclose = () => {
      isConnected.value = false;
      console.warn("⚠️ WebSocket 连接关闭，3 秒后重试...");
      setTimeout(() => connect(), 3000);
    };

    socket.value.onerror = (error) => {
      console.error("❌ WebSocket 错误:", error);
    };
  };

  // 组件挂载时连接
  onMounted(() => {
    connect();
  });

  // 组件卸载时关闭连接
  onUnmounted(() => {
    if (socket.value) {
      socket.value.close();
    }
  });

  return {
    isConnected,
    flightInfo,
    sensorData,
    status,
  };
}
