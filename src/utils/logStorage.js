import { toRaw } from "vue";

const DB_NAME = "FlightLogsDB";
const STORE_NAME = "logs";

// **生成 flight_id 作为主键**
const generateFlightKey = (flightInfo) => {
  if (!flightInfo || !flightInfo.model || !flightInfo.date) {
    console.error("❌ flight_info 结构错误:", flightInfo);
    return null;
  }
  return `${flightInfo.model}_${flightInfo.date}_${
    flightInfo.segment || "N/A"
  }`;
};

// **打开数据库**
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "flight_id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject("❌ IndexedDB 初始化失败");
  });
};

// 引入深度比较方法，例如使用 lodash 的 isEqual
import { isEqual } from "lodash-es";

// **存储日志**
export const saveLog = async ({ flightInfo, sensor_data }) => {
  if (!flightInfo || !sensor_data) {
    console.error("❌ 无效数据，无法存入 IndexedDB:", {
      flightInfo,
      sensor_data,
    });
    return;
  }
  // console.log("输入数据",{ flightInfo, sensor_data });
  flightInfo = toRaw(flightInfo);
  const flight_id = generateFlightKey(flightInfo);
  //console.log("FLIGHTID", flight_id);
  if (!flight_id) {
    console.error("❌ 无法生成 flight_id，跳过存储");
    return;
  }

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  const existingLog = await new Promise((resolve, reject) => {
    const request = store.get(flight_id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const sensorDataString = JSON.stringify(sensor_data);

  if (existingLog) {
    // **关键修改：使用深度对比代替 JSON.stringify**
    if (isEqual(existingLog.flightInfo, flightInfo)) {
      // console.log("📌 flight_id 存在，追加数据:", flight_id);
      existingLog.sensor_data.push(sensorDataString);

      await new Promise((resolve, reject) => {
        const request = store.put(existingLog);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } else {
      // **关键修改：生成全新的 flight_id（原ID+冲突标记+时间戳）**
      const conflictId = `${flight_id}_conflict_${Date.now()}`;
      console.warn("⚠️ flight_id 冲突但信息不匹配，新建记录:", conflictId);

      await new Promise((resolve, reject) => {
        const request = store.put({
          flight_id: conflictId,
          flightInfo,
          sensor_data: [sensorDataString],
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  } else {
    console.log("🆕 新建日志数据:", flight_id);
    await new Promise((resolve, reject) => {
      const request = store.put({
        flight_id,
        flightInfo,
        sensor_data: [sensorDataString],
      });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};

// **获取所有日志**
export const getLogs = async () => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const logs = request.result.map((log) => ({
        ...log,
        sensor_data: log.sensor_data
          ? log.sensor_data.map((data) => JSON.parse(data))
          : [],
      }));
      resolve(logs);
    };
    request.onerror = () => {
      console.error("❌ 读取 IndexedDB 失败");
      resolve([]);
    };
  });
};

// **获取指定 flight_id 的日志**
export const getLog = async (flight_id) => {
  if (!flight_id) return null;

  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve) => {
    const request = store.get(flight_id);
    request.onsuccess = () => {
      if (request.result) {
        request.result.sensor_data = request.result.sensor_data
          ? request.result.sensor_data.map((data) => JSON.parse(data))
          : [];
      }
      resolve(request.result);
    };
    request.onerror = () => {
      console.error("❌ 无法获取日志:", flight_id);
      resolve(null);
    };
  });
};
