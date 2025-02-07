import { createRouter, createWebHistory } from "vue-router";
import Dashboard from "@/views/DashboardView.vue";
import Logs from "@/views/LogsView.vue";
import Settings from "@/views/SettingsView.vue";

const routes = [
  { path: "/", component: Dashboard },
  { path: "/logs", component: Logs },
  { path: "/settings", component: Settings },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
