import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, {Rect} from 'react-native-svg';
import {colors} from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
};

const BUTTON_HEIGHT = 44;
const BORDER_RADIUS = BUTTON_HEIGHT / 2;
const GLOW_PADDING = 7;
// Three overlapping round-capped dashes form a comet: dim long tail, brighter
// short trail, and a white one-pixel head.
const COMET_TAIL_LENGTH = 46;
const COMET_TRAIL_LENGTH = 20;
const COMET_HEAD_LENGTH = 1;
const AnimatedRect = Animated.createAnimatedComponent(Rect);

/**
 * Gold button with a small comet continuously travelling around its rounded
 * border. Three animated rects share one timeline and use progressively shorter,
 * brighter strokes to create a fading tail and a white leading point.
 */
export const AnimatedGlowButton = ({label, onPress}: Props) => {
  const [buttonWidth, setButtonWidth] = useState(0);
  const borderTravel = useRef(new Animated.Value(0)).current;

  // Approximate the perimeter of a capsule: two straight edges plus one circle.
  const perimeter = useMemo(
    () =>
      buttonWidth > 0
        ? 2 * (buttonWidth - BUTTON_HEIGHT) + Math.PI * BUTTON_HEIGHT
        : 1,
    [buttonWidth],
  );

  useEffect(() => {
    if (buttonWidth === 0) {
      return;
    }

    borderTravel.setValue(0);
    const loop = Animated.loop(
      Animated.timing(borderTravel, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    );
    loop.start();

    return () => loop.stop();
  }, [borderTravel, buttonWidth]);

  const handleLayout = ({nativeEvent}: LayoutChangeEvent) => {
    const nextWidth = Math.round(nativeEvent.layout.width);
    setButtonWidth(current => (current === nextWidth ? current : nextWidth));
  };

  const dashOffset = borderTravel.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -perimeter],
  });
  // The comet now travels in the path's forward direction. Offset the shorter
  // dashes so all three layers end at the same leading point; otherwise the
  // long tail would appear in front of the head after reversing direction.
  const trailDashOffset = Animated.subtract(
    dashOffset,
    COMET_TAIL_LENGTH - COMET_TRAIL_LENGTH,
  );
  const headDashOffset = Animated.subtract(
    dashOffset,
    COMET_TAIL_LENGTH - COMET_HEAD_LENGTH,
  );
  const createDashArray = (length: number) =>
    `${length} ${Math.max(1, perimeter - length)}`;
  const tailDashArray = createDashArray(COMET_TAIL_LENGTH);
  const trailDashArray = createDashArray(COMET_TRAIL_LENGTH);
  const headDashArray = createDashArray(COMET_HEAD_LENGTH);

  return (
    <View onLayout={handleLayout} style={styles.container}>
      <TouchableOpacity
        accessibilityLabel={label}
        accessibilityRole="button"
        activeOpacity={0.76}
        onPress={onPress}
        style={styles.button}>
        <Text style={styles.label}>{label}</Text>
      </TouchableOpacity>

      {buttonWidth > 0 ? (
        <Svg
          height={BUTTON_HEIGHT + GLOW_PADDING * 2}
          pointerEvents="none"
          style={styles.glowCanvas}
          width={buttonWidth + GLOW_PADDING * 2}>
          <Rect
            fill="none"
            height={BUTTON_HEIGHT}
            rx={BORDER_RADIUS}
            stroke="#FFF1B0"
            strokeOpacity={0.48}
            strokeWidth={1}
            width={buttonWidth}
            x={GLOW_PADDING}
            y={GLOW_PADDING}
          />
          <AnimatedRect
            fill="none"
            height={BUTTON_HEIGHT}
            rx={BORDER_RADIUS}
            stroke={colors.goldSoft}
            strokeDasharray={tailDashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeOpacity={0.8}
            strokeWidth={8}
            width={buttonWidth}
            x={GLOW_PADDING}
            y={GLOW_PADDING}
          />
          <AnimatedRect
            fill="none"
            height={BUTTON_HEIGHT}
            rx={BORDER_RADIUS}
            stroke="#FFF4BE"
            strokeDasharray={trailDashArray}
            strokeDashoffset={trailDashOffset}
            strokeLinecap="round"
            strokeOpacity={0.48}
            strokeWidth={5.5}
            width={buttonWidth}
            x={GLOW_PADDING}
            y={GLOW_PADDING}
          />
          <AnimatedRect
            fill="none"
            height={BUTTON_HEIGHT}
            rx={BORDER_RADIUS}
            stroke="#FFFFFF"
            strokeDasharray={headDashArray}
            strokeDashoffset={headDashOffset}
            strokeLinecap="round"
            strokeWidth={5.2}
            width={buttonWidth}
            x={GLOW_PADDING}
            y={GLOW_PADDING}
          />
        </Svg>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  button: {
    height: BUTTON_HEIGHT,
    borderRadius: BORDER_RADIUS,
    backgroundColor: colors.gold,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.background,
    letterSpacing: 0.25,
  },
  glowCanvas: {
    position: 'absolute',
    left: -GLOW_PADDING,
    top: -GLOW_PADDING,
  },
});
