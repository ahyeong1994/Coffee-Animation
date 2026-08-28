module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  // Reanimated's plugin must remain last so worklets compile correctly.
  plugins: ['react-native-reanimated/plugin'],
};
