/**
 * @format
 */

import 'react-native';
import React from 'react';
import {expect, it, jest} from '@jest/globals';

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
import {AnimatedGlowButton} from '../src/components/common/AnimatedGlowButton';

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

it('fires the shared empty-state button action', () => {
  const onPress = jest.fn();
  let tree: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <AnimatedGlowButton label="Browse coffee" onPress={onPress} />,
    );
  });
  renderer.act(() => {
    tree.root
      .findByProps({accessibilityLabel: 'Browse coffee'})
      .props.onPress();
  });

  expect(onPress).toHaveBeenCalledTimes(1);

  renderer.act(() => {
    tree.unmount();
  });
});
