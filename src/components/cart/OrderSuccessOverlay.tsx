import React from 'react';
import {StatusBar, StyleSheet, Text, View} from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, {Path} from 'react-native-svg';
import {useOrderSuccessAnimation} from '../../animations/cart/useOrderSuccessAnimation';
import {colors} from '../../theme';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {onComplete: () => void};

/** Covers checkout with a drawn cyan check before navigation to Delivery. */
export const OrderSuccessOverlay = ({onComplete}: Props) => {
  const animation = useOrderSuccessAnimation(onComplete);

  return (
    <Animated.View
      accessibilityLabel="Order placed. Opening delivery status."
      accessibilityLiveRegion="assertive"
      style={[styles.overlay, animation.overlayStyle]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.markWrap}>
        <Animated.View style={[styles.glow, animation.glowStyle]} />
        <Animated.View style={[styles.circle, animation.circleStyle]}>
          <Svg height={64} viewBox="0 0 24 24" width={64}>
            <AnimatedPath
              animatedProps={animation.checkAnimatedProps}
              d="M4.8 12.4L9.1 16.6L19.3 6.5"
              fill="none"
              stroke={colors.success}
              strokeDasharray="40"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.35}
            />
          </Svg>
        </Animated.View>
      </View>
      <Animated.View style={[styles.copy, animation.copyStyle]}>
        <Text style={styles.eyebrow}>CONFIRMED</Text>
        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.message}>Your coffee is being prepared.</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    elevation: 100,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markWrap: {
    width: 124,
    height: 124,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowOpacity: 0.82,
    shadowRadius: 28,
    elevation: 16,
  },
  circle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 1.5,
    borderColor: colors.success,
    backgroundColor: '#102523',
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {alignItems: 'center', marginTop: 24},
  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2.4,
    color: colors.success,
  },
  title: {
    marginTop: 9,
    fontSize: 27,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: colors.text,
  },
  message: {marginTop: 8, fontSize: 12, color: colors.muted},
});
