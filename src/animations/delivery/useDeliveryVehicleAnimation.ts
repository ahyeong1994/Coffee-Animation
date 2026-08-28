import {useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';
import {Delivery} from '../../types/app';

/** Animates the delivery bike between Brewing and Arriving checkpoints. */
export const useDeliveryVehicleAnimation = (
  status: Delivery['status'],
  trackWidth: number,
) => {
  const travel = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const active = status !== 'Delivered';

  useEffect(() => {
    travel.stopAnimation();
    bounce.stopAnimation();
    const destination =
      status === 'Brewing' ? 0 : status === 'Arriving' ? 0.5 : 1;
    travel.setValue(destination);
    bounce.setValue(0);

    if (!active) {
      return;
    }

    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    bounceLoop.start();

    const drive =
      status === 'Arriving'
        ? Animated.timing(travel, {
            toValue: destination,
            duration: 1250,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: true,
          })
        : null;

    if (drive) {
      travel.setValue(0);
      // Keep the bike bouncing after it reaches Arriving to show live progress.
      drive.start();
    }

    return () => {
      drive?.stop();
      bounceLoop.stop();
    };
  }, [active, bounce, status, travel]);

  const firstStop = 0;
  const middleStop = Math.max(0, trackWidth / 2 - 5);
  const finalStop = Math.max(0, trackWidth - 10);

  return {
    active,
    translateX: travel.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [firstStop, middleStop, finalStop],
    }),
    translateY: bounce.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -3],
    }),
    rotate: bounce.interpolate({
      inputRange: [0, 1],
      outputRange: ['-2deg', '2deg'],
    }),
  };
};
