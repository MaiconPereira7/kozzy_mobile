module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Esta é a linha que precisamos:
      'react-native-reanimated/plugin',
    ],
  };
};