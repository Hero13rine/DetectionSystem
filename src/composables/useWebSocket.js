import { ref, onMounted, onUnmounted } from "vue";

export function useWebSocket(url, onMessageCallback) {
  const socket = ref(null);
  const isConnected = ref(false);
  const flightInfo = ref(null); // 当前飞行信息
  const sensorData = ref([]); // 传感器数据队列
  const maxQueueSize = 100; // 最大数据队列长度
  const status = ref("normal"); // 当前飞行状态
  const isListening = ref(true);
  // 初始化 WebSocket 连接
  const connect = () => {
    socket.value = new WebSocket(url);

    socket.value.onopen = () => {
      isConnected.value = true;
      console.log("✅ WebSocket 连接成功");

      // 连接成功后，同步前后端状态
      if (!isListening.value) {
        console.log("暂停");
        sendControlMessage("pause"); // 如果前端是暂停状态，通知后端暂停
      } else {
        console.log("恢复");
        sendControlMessage("resume"); // 如果前端是监听状态，通知后端恢复
      }
    };

    socket.value.onmessage = (event) => {
      if (!isListening.value) {
        console.log("暂停");
        sendControlMessage("pause"); // 如果前端是暂停状态，通知后端暂停
      } else {
        console.log("恢复");
        sendControlMessage("resume"); // 如果前端是监听状态，通知后端恢复
      } // **暂停监听时，不处理数据**
      try {
        const data = JSON.parse(event.data);

        // console.log("📄 收到飞行信息:", data.flightnfo);
        // 更新飞行信息
        if (
          data.flight_info &&
          JSON.stringify(data.flight_info) !== JSON.stringify(flightInfo.value)
        ) {
          flightInfo.value = data.flight_info;
          // console.log("📄 收到飞行信息:", flightInfo.value);
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

        //console.log("📥 收到传感器数据:", data.sensor_data);
      } catch (error) {
        console.error("❌ 消息解析失败:", error);
      }
    };

    socket.value.onclose = () => {
      isConnected.value = false;
      console.warn("⚠️ WebSocket 连接关闭，3 秒后重试...");
      setTimeout(() => connect(), 3000);
    };
  };
  // 切换监听状态
  const toggleListening = () => {
    isListening.value = !isListening.value;
    const action = isListening.value ? "resume" : "pause";
    sendControlMessage(action); // 通知后端暂停或恢复
    console.log(
      isListening.value
        ? "▶️ 开始监听 WebSocket 数据"
        : "⏸ 暂停监听 WebSocket 数据"
    );
  };
  // 发送控制消息（暂停或恢复）
  const sendControlMessage = (action) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify({ control: action }));
      console.log(`📤 发送控制消息: ${action}`);
    }
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
    isListening, // 暴露监听状态
    toggleListening, // 暴露切换监听的方法
  };
}
