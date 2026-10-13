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

jest.mock('lottie-react-native', () => {
  const ReactModule = require('react');
  const {View} = require('react-native');

  return {
    __esModule: true,
    default: ReactModule.forwardRef(
      (props: object, ref: React.Ref<unknown>) => <View {...props} ref={ref} />,
    ),
  };
});

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
import {OrderSummaryModal} from '../src/components/cart/OrderSummaryModal';
import {AnimatedGlowButton} from '../src/components/common/AnimatedGlowButton';
import {coffees, initialDeliveries} from '../src/data/coffee';
import {DeliveryScreen} from '../src/screens/DeliveryScreen';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

it('renders correctly', () => {
  let tree!: renderer.ReactTestRenderer;

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

it('shows cart details before exposing the final order control', () => {
  const line = {
    id: 'velvet-latte:M',
    coffee: coffees[0],
    size: 'M' as const,
    unitPrice: coffees[0].prices.M,
    quantity: 2,
  };
  let tree!: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <OrderSummaryModal
        checkoutMethod="slide"
        deliveryFee={1.5}
        lines={[line]}
        onClose={jest.fn()}
        onProcess={jest.fn()}
        subtotal={11.6}
        visible
      />,
    );
  });

  expect(tree.root.findByProps({children: 'Order summary'})).toBeTruthy();
  expect(
    tree.root.findByProps({
      accessibilityLabel: 'Velvet Latte, Size M, quantity 2, $11.60',
    }),
  ).toBeTruthy();
  expect(
    tree.root.findByProps({accessibilityLabel: 'Slide to place order'}),
  ).toBeTruthy();

  renderer.act(() => {
    tree.unmount();
  });
});

it('opens the saved order information from a delivery card', () => {
  let tree!: renderer.ReactTestRenderer;

  renderer.act(() => {
    tree = renderer.create(
      <DeliveryScreen
        deliveries={initialDeliveries}
        onChangeStatus={jest.fn()}
      />,
    );
  });
  renderer.act(() => {
    tree.root
      .findByProps({accessibilityLabel: 'View details for order CF-2408'})
      .props.onPress();
  });

  expect(
    tree.root.findByProps({
      accessibilityLabel: 'Delivery details for order CF-2408',
    }),
  ).toBeTruthy();
  expect(
    tree.root.findByProps({
      accessibilityLabel: 'Velvet Latte, Size M, quantity 2, $11.60',
    }),
  ).toBeTruthy();

  renderer.act(() => {
    tree.unmount();
  });
});
