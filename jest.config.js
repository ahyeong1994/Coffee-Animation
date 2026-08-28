module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['./jest-setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|react-native-reanimated)/)',
  ],
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
};
