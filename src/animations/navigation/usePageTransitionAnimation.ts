import {DependencyList, useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';

/**
 * Creates a short fade-and-rise transition whenever a page key changes.
 * COPY NOTE: pass stable route keys in dependencies; opacity and translateY can
 * be attached directly to the page container.
 */
export const usePageTransitionAnimation = (dependencies: DependencyList) => {
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // The caller intentionally controls when the page should transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, ...dependencies]);

  return {
    opacity: progress,
    translateY: progress.interpolate({
      inputRange: [0, 1],
      outputRange: [10, 0],
    }),
  };
};
