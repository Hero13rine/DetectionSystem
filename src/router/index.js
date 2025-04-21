import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/DashboardView.vue";
import Logs from "@/views/LogsView.vue";
import Settings from "@/views/SettingsView.vue";
import Welcome from "@/views/welcome.vue"; // 
const routes = [
  { path: "/", component: Welcome, meta: { showHeader: false } }, // 👈 欢迎页不显示头部
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { keepAlive: true, showHeader: true },
  },
  { path: "/logs", component: Logs, meta: { showHeader: true } },
  { path: "/settings", component: Settings, meta: { showHeader: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
