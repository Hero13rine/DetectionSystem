import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/DashboardView.vue";
import Logs from "@/views/LogsView.vue";
import Settings from "@/views/SettingsView.vue";

const routes = [
  { path: "/", component: Dashboard, meta: { keepAlive: true } }, // ✅ 让 `DashboardView.vue` 被 `keep-alive` 缓存
  { path: "/logs", component: Logs },
  { path: "/settings", component: Settings },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
