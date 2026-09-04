import React, {useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, View} from 'react-native';
import Svg, {Path} from 'react-native-svg';

type Props = {
  color: string;
  size?: number;
  strokeWidth?: number;
};

// These X coordinates match Lucide Coffee's original three steam paths in its
// 24 × 24 viewBox, which preserves the source icon's proportions.
const STEAM_X = [6, 10, 14] as const;
// Each value is a percentage of icon size. Alternating signs stop all three
// steam lines from drifting in exactly the same direction.
const STEAM_DRIFT = [-0.06, 0.045, -0.035] as const;
// Duration of one steam line rising from the cup and fading away.
const STEAM_RISE_DURATION = 920;
// Delay between the left, middle, and right steam lines.
const STEAM_STAGGER = 240;

/**
 * Preserves Lucide Coffee's original cup path while animating its three steam
 * strokes independently. Each stroke rises, drifts, fades, and restarts at the
 * cup with a stagger so the icon always has visible steam.
 */
export const AnimatedCoffeeIcon = ({
  color,
  size = 24,
  strokeWidth = 2,
}: Props) => {
  // Give every steam line its own 0 -> 1 timeline so they can be staggered.
  const steamProgress = useRef(
    STEAM_X.map(() => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const lastIndex = STEAM_X.length - 1;
    const loops = steamProgress.map((progress, index) => {
      progress.setValue(0);
      return Animated.loop(
        Animated.sequence([
          // Increasing front delay starts the three lines one after another.
          Animated.delay(index * STEAM_STAGGER),
          Animated.timing(progress, {
            toValue: 1,
            duration: STEAM_RISE_DURATION,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          // Decreasing end delay makes every loop the same total duration:
          // front delay + rise + end delay. This keeps the stagger stable.
          Animated.delay((lastIndex - index) * STEAM_STAGGER),
        ]),
      );
    });

    loops.forEach(loop => loop.start());
    // Infinite loops must be stopped when the tab bar/empty state unmounts.
    return () => loops.forEach(loop => loop.stop());
  }, [steamProgress]);

  // Scale thickness/height from props, but enforce a readable minimum for the
  // 18px tab icon. The same component therefore also works at 32px empty state.
  const lineWidth = Math.max(1.15, strokeWidth * 0.96);
  const lineHeight = Math.max(lineWidth * 1.4, (size * 3) / 24);

  return (
    <View style={{height: size, width: size}}>
      <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
        {/* Exact cup/body path from Lucide Coffee; only its steam is replaced. */}
        <Path
          d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={strokeWidth}
        />
      </Svg>

      {steamProgress.map((progress, index) => (
        <Animated.View
          key={STEAM_X[index]}
          pointerEvents="none"
          style={[
            styles.steam,
            {
              backgroundColor: color,
              borderRadius: lineWidth / 2,
              height: lineHeight,
              left: (size * STEAM_X[index]) / 24 - lineWidth / 2,
              opacity: progress.interpolate({
                // Become fully visible near the cup, then dissolve in the air.
                inputRange: [0, 0.16, 0.68, 1],
                outputRange: [0.72, 1, 0.78, 0],
              }),
              top: (size * 2) / 24,
              width: lineWidth,
              transform: [
                {
                  translateX: progress.interpolate({
                    // Small per-line horizontal drift makes the steam organic.
                    inputRange: [0, 1],
                    outputRange: [0, size * STEAM_DRIFT[index]],
                  }),
                },
                {
                  translateY: progress.interpolate({
                    // Use size-relative distance so both icon sizes rise equally.
                    inputRange: [0, 1],
                    outputRange: [0, -size * 0.26],
                  }),
                },
                {
                  scaleY: progress.interpolate({
                    // Stretch in the middle, then contract as the line disappears.
                    inputRange: [0, 0.55, 1],
                    outputRange: [1, 1.34, 0.82],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  steam: {
    position: 'absolute',
  },
});
