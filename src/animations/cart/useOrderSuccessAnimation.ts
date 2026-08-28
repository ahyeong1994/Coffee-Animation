import {useEffect, useRef} from 'react';
import {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const CHECK_PATH_LENGTH = 40;
const ORDER_SUCCESS_DURATION = 1900;

/**
 * Runs the Reanimated order-confirmation reveal.
 *
 * COPY NOTES
 * - The SVG path needs Animated.createAnimatedComponent(Path) in the renderer.
 * - CHECK_PATH_LENGTH must cover the SVG path length; a larger value is safe.
 * - Keep react-native-reanimated/plugin last in babel.config.js.
 */
export const useOrderSuccessAnimation = (onFinished: () => void) => {
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;
  const overlayOpacity = useSharedValue(0);
  const circleScale = useSharedValue(0.45);
  const glowScale = useSharedValue(0.72);
  const glowOpacity = useSharedValue(0);
  const checkOffset = useSharedValue(CHECK_PATH_LENGTH);
  const copyOpacity = useSharedValue(0);
  const copyTranslateY = useSharedValue(12);

  useEffect(() => {
    // Phase 1: fade in the full-screen layer and spring the circle into place.
    overlayOpacity.value = withTiming(1, {duration: 180});
    circleScale.value = withDelay(
      100,
      withSpring(1, {damping: 11, stiffness: 175, mass: 0.75}),
    );
    // Phase 2: strokeDashoffset 40 -> 0 creates the hand-drawn checkmark.
    checkOffset.value = withDelay(
      330,
      withTiming(0, {
        duration: 520,
        easing: Easing.out(Easing.cubic),
      }),
    );
    // Phase 3: pulse opacity and scale independently for a softer cyan bloom.
    glowOpacity.value = withDelay(
      520,
      withSequence(
        withTiming(0.72, {duration: 200}),
        withRepeat(
          withSequence(
            withTiming(0.28, {duration: 360}),
            withTiming(0.58, {duration: 360}),
          ),
          2,
          true,
        ),
      ),
    );
    glowScale.value = withDelay(
      500,
      withSequence(
        withTiming(1.16, {
          duration: 420,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(1.02, {duration: 420}),
      ),
    );
    // Phase 4: reveal supporting copy after the checkmark is readable.
    copyOpacity.value = withDelay(720, withTiming(1, {duration: 360}));
    copyTranslateY.value = withDelay(
      720,
      withSpring(0, {damping: 16, stiffness: 170}),
    );

    // Navigation stays outside this hook; the parent decides what happens next.
    const completionTimer = setTimeout(
      () => onFinishedRef.current(),
      ORDER_SUCCESS_DURATION,
    );
    return () => clearTimeout(completionTimer);
  }, [
    checkOffset,
    circleScale,
    copyOpacity,
    copyTranslateY,
    glowOpacity,
    glowScale,
    overlayOpacity,
  ]);

  return {
    checkAnimatedProps: useAnimatedProps(() => ({
      strokeDashoffset: checkOffset.value,
    })),
    circleStyle: useAnimatedStyle(() => ({
      transform: [{scale: circleScale.value}],
    })),
    copyStyle: useAnimatedStyle(() => ({
      opacity: copyOpacity.value,
      transform: [{translateY: copyTranslateY.value}],
    })),
    glowStyle: useAnimatedStyle(() => ({
      opacity: glowOpacity.value,
      transform: [{scale: glowScale.value}],
    })),
    overlayStyle: useAnimatedStyle(() => ({
      opacity: overlayOpacity.value,
    })),
  };
};
