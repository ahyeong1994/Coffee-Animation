/**
 * @format
 */

import 'react-native';
import React from 'react';
import {it, jest} from '@jest/globals';

jest.mock('@react-native-camera-roll/camera-roll', () => ({
  CameraRoll: {save: jest.fn(async () => 'saved-photo')},
}));

jest.mock('react-native-sensors', () => ({
  accelerometer: {
    subscribe: jest.fn(() => ({unsubscribe: jest.fn()})),
  },
  SensorTypes: {accelerometer: 'accelerometer'},
  setUpdateIntervalForType: jest.fn(),
}));

jest.mock('react-native-vision-camera', () => {
  const ReactModule = require('react');
  const {View} = require('react-native');

  return {
    Camera: ReactModule.forwardRef((props: object, ref: React.Ref<unknown>) => (
      <View {...props} ref={ref} />
    )),
    useCameraDevice: () => undefined,
    useCameraPermission: () => ({
      hasPermission: false,
      requestPermission: jest.fn(async () => false),
    }),
  };
});

import App from '../src/App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(<App />);
  });
  renderer.act(() => {
    tree.unmount();
  });
});
