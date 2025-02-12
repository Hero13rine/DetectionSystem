import { ref, onMounted, onUnmounted } from "vue";

export function useWebSocket(url, onMessageCallback) {
  const socket = ref(null);
  const isConnected = ref(false);
  const dataQueue = ref([]); // **数据缓冲区**
  const maxQueueSize = 10; // **最多缓存 10 条数据**

  const connect = () => {
    socket.value = new WebSocket(url);

    socket.value.onopen = () => {
      isConnected.value = true;
      console.log(`✅ WebSocket 连接成功: ${url}`);
    };

    socket.value.onmessage = (event) => {
      const data = JSON.parse(event.data);
      dataQueue.value.push(data);

      // **保证队列长度不超过 `maxQueueSize`**
      if (dataQueue.value.length > maxQueueSize) {
        dataQueue.value.shift();
      }

      // **回调函数通知组件新数据**
      if (onMessageCallback) {
        onMessageCallback(dataQueue.value[dataQueue.value.length - 1]);
      }
    };

    socket.value.onclose = () => {
      isConnected.value = false;
      console.warn("⚠️ WebSocket 断开，3 秒后尝试重连...");
      setTimeout(() => connect(), 3000);
    };
  };

  onMounted(() => connect());
  onUnmounted(() => {
    if (socket.value) {
      socket.value.close();
    }
  });

  return { isConnected, dataQueue };
}
