import {useRef, useState} from 'react';
import {Animated, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

/** Moves the full search field into a compact sticky header while scrolling. */
export const useStickySearchAnimation = () => {
  const [stickySearchVisible, setStickySearchVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const stickySearchVisibleRef = useRef(false);

  /** Updates pointer-events only when the sticky visibility threshold changes. */
  const handleScrollState = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const visible = event.nativeEvent.contentOffset.y >= 105;
    if (visible !== stickySearchVisibleRef.current) {
      stickySearchVisibleRef.current = visible;
      setStickySearchVisible(visible);
    }
  };

  return {
    scrollY,
    stickySearchVisible,
    handleScrollState,
    stickySearchOpacity: scrollY.interpolate({
      inputRange: [78, 118],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    stickySearchTranslateY: scrollY.interpolate({
      inputRange: [78, 118],
      outputRange: [-9, 0],
      extrapolate: 'clamp',
    }),
    fullSearchOpacity: scrollY.interpolate({
      inputRange: [58, 100],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    }),
  };
};
