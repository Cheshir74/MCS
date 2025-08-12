module.exports = function (api) {
  api.cache(true); // Кэширование конфига для производительности

  const presets = [
    [
      "@babel/preset-env", // Транспиляция современного JS в совместимый код
      {
        targets: "> 0.25%, not dead", // Браузеры, которые нужно поддерживать
        useBuiltIns: "usage", // Автоматическая полифиллка только используемых фич
        corejs: "3.36", // Версия core-js (убедитесь, что она установлена)
      },
    ],
    [
      "@babel/preset-react", // Поддержка JSX и React
      {
        runtime: "automatic", // Автоматически импортирует `jsx` из 'react/jsx-runtime' (новый синтаксис)
        development: process.env.NODE_ENV === "development", // Оптимизации для разработки
      },
    ],
  ];

  const plugins = [
    // Дополнительные плагины, если нужны
    // "@babel/plugin-transform-runtime", // Для асинхронного кода (если используется)
  ];

  return {
    presets,
    plugins,
    sourceType: "unambiguous", // Важно для корректной работы с ES-модулями
  };
};
