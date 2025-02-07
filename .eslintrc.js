module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended", // 确保 ESLint 识别 Vue 3 语法
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },
  rules: {
    "vue/multi-word-component-names": "off", // 关闭组件名称必须多词的规则
    "no-undef": "off", // 关闭 `defineExpose` 未定义的报错
  },
};
