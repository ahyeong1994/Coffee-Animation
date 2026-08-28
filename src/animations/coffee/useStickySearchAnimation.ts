import {useRef, useState} from 'react';
import {Animated, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

/**
 * Moves the full search field into a compact sticky header while scrolling.
 * COPY NOTE: tune 78/118 for the visual cross-fade and 105 for pointer events.
 */
export const useStickySearchAnimation = () => {
  const [stickySearchVisible, setStickySearchVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const stickySearchVisibleRef = useRef(false);

  /** Updates pointer-events only when the sticky visibility threshold changes. */
  const handleScrollState = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    // React state changes only when crossing the threshold, not on every frame.
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
    // The two search fields overlap briefly to avoid a visible blank frame.
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
