import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Easing} from 'react-native';
import {Coffee} from '../../types/app';

export type Point = {x: number; y: number};

export type CartFlight = {
  coffee: Coffee;
  start: Point;
  target: Point;
};

/**
 * Animates an item from its source coordinates into the cart and pulses the
 * target on arrival. Supply any renderable payload by adapting CartFlight.
 */
export const useCartFlightAnimation = () => {
  const [flight, setFlight] = useState<CartFlight | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const cartScale = useRef(new Animated.Value(1)).current;
  const runningAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const pulseCart = useCallback(() => {
    Animated.sequence([
      Animated.timing(cartScale, {
        toValue: 1.16,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(cartScale, {
        toValue: 1,
        damping: 9,
        stiffness: 230,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cartScale]);

  /** Starts a new flight and safely cancels a previous unfinished one. */
  const launch = useCallback(
    (coffee: Coffee, start: Point, target: Point) => {
      runningAnimation.current?.stop();
      progress.setValue(0);
      setFlight({coffee, start, target});
    },
    [progress],
  );

  useEffect(() => {
    if (!flight) {
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 900,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });
    runningAnimation.current = animation;
    animation.start(({finished}) => {
      if (finished) {
        setFlight(null);
        pulseCart();
      }
    });

    return () => animation.stop();
  }, [flight, progress, pulseCart]);

  return {cartScale, flight, launch, progress};
};
