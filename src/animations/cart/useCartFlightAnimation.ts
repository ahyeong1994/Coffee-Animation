import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Easing} from 'react-native';
import {Coffee} from '../../types/app';

export type Point = {x: number; y: number};

export type CartFlight = {
  coffee: Coffee;
  start: Point;
  target: Point;
};

type QueuedCartFlight = CartFlight & {onArrival?: () => void};

/**
 * Animates measured items into a measured target, one after another.
 *
 * COPY NOTES
 * - start/target must use the same coordinate system; measureInWindow is the
 *   easiest option when the flying layer covers the screen.
 * - progress is normalized from 0 to 1. The visual component decides the path.
 * - onArrival is where cart state should update, so the badge changes only
 *   after the visual item lands.
 */
export const useCartFlightAnimation = () => {
  const [flight, setFlight] = useState<CartFlight | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const cartScale = useRef(new Animated.Value(1)).current;
  const onArrivalRef = useRef<(() => void) | null>(null);
  const queuedFlightsRef = useRef<QueuedCartFlight[]>([]);
  const flightActiveRef = useRef(false);

  /** Commits the pending cart update exactly once when the item arrives. */
  const finishArrival = useCallback(() => {
    const onArrival = onArrivalRef.current;
    onArrivalRef.current = null;
    onArrival?.();
  }, []);

  const pulseCart = useCallback(() => {
    // A fast overshoot followed by a spring gives the target a physical impact.
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

  /** Makes one queued request visible and resets its normalized timeline. */
  const startFlight = useCallback(
    ({coffee, start, target, onArrival}: QueuedCartFlight) => {
      flightActiveRef.current = true;
      onArrivalRef.current = onArrival ?? null;
      progress.setValue(0);
      setFlight({coffee, start, target});
    },
    [progress],
  );

  /** Adds every rapid tap to FIFO instead of interrupting the current flight. */
  const launch = useCallback(
    (coffee: Coffee, start: Point, target: Point, onArrival?: () => void) => {
      const nextFlight = {coffee, start, target, onArrival};
      if (flightActiveRef.current) {
        queuedFlightsRef.current.push(nextFlight);
        return;
      }
      startFlight(nextFlight);
    },
    [startFlight],
  );

  // If navigation unmounts the screen, commit active and queued additions so
  // the user's taps are never lost even though their visuals can no longer run.
  useEffect(
    () => () => {
      finishArrival();
      queuedFlightsRef.current.splice(0).forEach(item => item.onArrival?.());
      flightActiveRef.current = false;
    },
    [finishArrival],
  );

  useEffect(() => {
    if (!flight) {
      return;
    }

    // The renderer maps this single value to a curved X/Y path, rotation,
    // opacity and scale. Change duration/easing here to retime the whole flight.
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 900,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start(({finished}) => {
      if (finished) {
        finishArrival();
        pulseCart();

        const nextFlight = queuedFlightsRef.current.shift();
        if (nextFlight) {
          // Starting immediately produces an uninterrupted stream for rapid taps.
          startFlight(nextFlight);
        } else {
          flightActiveRef.current = false;
          setFlight(null);
        }
      }
    });

    return () => animation.stop();
  }, [finishArrival, flight, progress, pulseCart, startFlight]);

  return {cartScale, flight, launch, progress};
};
