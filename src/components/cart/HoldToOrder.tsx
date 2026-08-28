import React, {useState} from 'react';
import {Check} from 'lucide-react-native';
import Svg, {
  Defs,
  LinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  HOLD_PARTICLES,
  HOLD_PARTICLES_ENABLED,
} from '../../animations/cart/holdToOrderParticles';
import {useHoldToOrderAnimation} from '../../animations/cart/useHoldToOrderAnimation';
import {colors} from '../../theme';

type Props = {onComplete: () => void};

/** Requires a continuous hold, then plays completion and optional particles. */
export const HoldToOrder = ({onComplete}: Props) => {
  const [width, setWidth] = useState(0);
  const animation = useHoldToOrderAnimation({onComplete, width});

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const label = animation.completed
    ? 'Order placed'
    : animation.holding
    ? 'Keep holding...'
    : 'Hold to place order';

  const labelContent = (foreground = false) => (
    <View style={[styles.labelRow, width ? {width} : null]}>
      {animation.completed && foreground ? (
        <Animated.View style={{transform: [{scale: animation.successScale}]}}>
          <Check color={colors.background} size={18} strokeWidth={2.8} />
        </Animated.View>
      ) : null}
      <Text
        style={[
          styles.label,
          foreground && styles.foregroundLabel,
          animation.completed && foreground && styles.completedLabel,
        ]}>
        {label}
      </Text>
    </View>
  );

  return (
    <Animated.View
      style={[styles.container, {transform: [{scale: animation.scale}]}]}>
      <Pressable
        accessibilityActions={[{name: 'activate', label: 'Place order'}]}
        accessibilityHint="Press and hold until the progress is complete"
        accessibilityLabel={label}
        accessibilityRole="button"
        hitSlop={4}
        onAccessibilityAction={event => {
          if (event.nativeEvent.actionName === 'activate') {
            animation.finish();
          }
        }}
        onLayout={handleLayout}
        onPressIn={animation.startHolding}
        onPressOut={animation.cancelHolding}
        style={styles.track}>
        <View pointerEvents="none" style={styles.baseLabel}>
          {labelContent()}
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.progressFill,
            animation.completed && styles.completedFill,
            {
              width: animation.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, width],
              }),
            },
          ]}>
          {!animation.completed ? (
            <>
              <Svg height="100%" style={styles.gradient} width="100%">
                <Defs>
                  <LinearGradient id="goldFlow" x1="0" x2="1" y1="0" y2="0">
                    <Stop offset="0" stopColor="#FFF7D6" />
                    <Stop offset="0.22" stopColor={colors.cream} />
                    <Stop offset="0.48" stopColor={colors.goldSoft} />
                    <Stop offset="0.76" stopColor={colors.gold} />
                    <Stop
                      offset="1"
                      stopColor={colors.background}
                      stopOpacity="0.78"
                    />
                  </LinearGradient>
                  <RadialGradient
                    cx="32%"
                    cy="50%"
                    id="softBloom"
                    rx="54%"
                    ry="100%">
                    <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
                    <Stop
                      offset="0.38"
                      stopColor={colors.goldSoft}
                      stopOpacity="0.6"
                    />
                    <Stop offset="1" stopColor={colors.gold} stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect fill="url(#goldFlow)" height="100%" width="100%" />
                <Rect fill="url(#softBloom)" height="100%" width="100%" />
              </Svg>
              <Animated.View
                style={[
                  styles.shineSweep,
                  {
                    opacity: animation.glowPulse,
                    transform: [
                      {
                        translateX: animation.shine.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-76, Math.max(0, width - 10)],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[styles.glowHead, {opacity: animation.glowPulse}]}
              />
            </>
          ) : (
            <Animated.View
              style={[styles.successGlow, {opacity: animation.glowPulse}]}
            />
          )}
          {labelContent(true)}
        </Animated.View>
      </Pressable>
      {HOLD_PARTICLES_ENABLED && (animation.holding || animation.completed) ? (
        <View pointerEvents="none" style={styles.particleField}>
          {HOLD_PARTICLES.map((particle, index) => {
            const particleAnimation = animation.particleProgress[index];

            return (
              <Animated.View
                key={index}
                style={[
                  styles.sparkle,
                  {
                    left: particle.x * width,
                    top: particle.y,
                    width: particle.size,
                    height: particle.size,
                    backgroundColor: particle.color,
                    opacity: particleAnimation.interpolate({
                      inputRange: [0, 0.18, 0.62, 1],
                      outputRange: [0, 1, 0.72, 0],
                    }),
                    transform: [
                      {
                        translateX: particleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, particle.driftX],
                        }),
                      },
                      {
                        translateY: particleAnimation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -particle.travelY],
                        }),
                      },
                      {
                        scale: particleAnimation.interpolate({
                          inputRange: [0, 0.22, 0.7, 1],
                          outputRange: [0.2, 1.55, 0.9, 0.1],
                        }),
                      },
                    ],
                  },
                ]}
              />
            );
          })}
        </View>
      ) : null}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {position: 'relative'},
  track: {
    height: 58,
    borderRadius: 21,
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  baseLabel: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressFill: {
    ...StyleSheet.absoluteFillObject,
    right: undefined,
    backgroundColor: colors.background,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  completedFill: {backgroundColor: colors.cream},
  gradient: {...StyleSheet.absoluteFillObject},
  shineSweep: {
    position: 'absolute',
    top: -13,
    bottom: -13,
    width: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFF7D6',
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 5,
  },
  glowHead: {
    position: 'absolute',
    top: 0,
    right: -12,
    bottom: 0,
    width: 34,
    backgroundColor: colors.goldSoft,
    shadowColor: colors.goldSoft,
    shadowOpacity: 0.9,
    shadowRadius: 12,
  },
  successGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.white,
    shadowColor: colors.goldSoft,
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },
  particleField: {
    ...StyleSheet.absoluteFillObject,
    top: -9,
    bottom: -11,
    zIndex: 3,
  },
  sparkle: {
    position: 'absolute',
    borderRadius: 4,
    shadowColor: colors.goldSoft,
    shadowOpacity: 1,
    shadowRadius: 7,
    elevation: 3,
  },
  labelRow: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  label: {fontSize: 12, fontWeight: '900', color: colors.background},
  foregroundLabel: {color: colors.goldSoft},
  completedLabel: {color: colors.background},
});
