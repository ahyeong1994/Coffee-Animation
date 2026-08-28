import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Easing, PanResponder} from 'react-native';

type Options = {
  maxTravel: number;
  onComplete: () => void;
};

/**
 * Reusable slide-to-confirm controller.
 *
 * COPY NOTES
 * 1. Measure your track and pass the thumb's maximum X distance as maxTravel.
 * 2. Attach panHandlers to the track and translateX to the thumb.
 * 3. useNativeDriver is false only for translateX because the value is also
 *    updated directly by PanResponder during the drag.
 */
export const useSlideToOrderAnimation = ({maxTravel, onComplete}: Options) => {
  const [completed, setCompleted] = useState(false);

  // The three values are deliberately separate: drag position, touch feedback,
  // and the idle arrow hint can then animate without affecting one another.
  const translateX = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;
  const arrowProgress = useRef(new Animated.Value(0)).current;
  const completingRef = useRef(false);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Loop 0 -> 1 -> 0 to make the chevrons gently sweep while idle.
  useEffect(() => {
    const arrowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowProgress, {
          toValue: 1,
          duration: 760,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(arrowProgress, {
          toValue: 0,
          duration: 760,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    arrowLoop.start();

    // Always stop infinite loops and timers when copying this hook elsewhere.
    return () => {
      arrowLoop.stop();
      if (completionTimer.current) {
        clearTimeout(completionTimer.current);
      }
    };
  }, [arrowProgress]);

  const animateThumbScale = useCallback(
    (toValue: number) => {
      Animated.spring(thumbScale, {
        toValue,
        damping: 18,
        stiffness: 280,
        useNativeDriver: true,
      }).start();
    },
    [thumbScale],
  );

  // An incomplete gesture springs back instead of snapping to the start.
  const reset = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: false,
    }).start();
  }, [translateX]);

  const finish = useCallback(() => {
    if (completingRef.current || !maxTravel) {
      return;
    }

    completingRef.current = true;
    setCompleted(true);
    Animated.timing(translateX, {
      toValue: maxTravel,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({finished}) => {
      // A short pause lets the end user see the completed thumb before the
      // parent opens the full-screen order-success animation.
      if (finished) {
        completionTimer.current = setTimeout(onComplete, 220);
      }
    });
  }, [maxTravel, onComplete, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !completingRef.current &&
          Math.abs(gesture.dx) > 5 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => animateThumbScale(1.06),
        onPanResponderMove: (_, gesture) => {
          // Clamp the thumb so it never leaves the visual track.
          translateX.setValue(Math.max(0, Math.min(maxTravel, gesture.dx)));
        },
        onPanResponderRelease: (_, gesture) => {
          animateThumbScale(1);
          const crossedDistance = gesture.dx >= maxTravel * 0.78;
          const fastEnough = gesture.vx > 0.9 && gesture.dx > maxTravel * 0.58;
          crossedDistance || fastEnough ? finish() : reset();
        },
        onPanResponderTerminate: () => {
          animateThumbScale(1);
          reset();
        },
      }),
    [animateThumbScale, finish, maxTravel, reset, translateX],
  );

  return {
    arrowProgress,
    completed,
    finish,
    panHandlers: panResponder.panHandlers,
    thumbScale,
    translateX,
  };
};
