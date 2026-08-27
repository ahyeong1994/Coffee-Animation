import React, {useCallback, useEffect, useRef, useState} from 'react';
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
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors} from '../../theme';

const HOLD_DURATION = 8600;
// Toggle this to compare the hold animation with or without particles.
const ENABLE_PARTICLE_EFFECT = false;
const PARTICLE_COLORS = [colors.white, colors.cream, colors.goldSoft];
const PARTICLES = Array.from({length: 42}, (_, index) => {
  const upperRow = index % 2 === 0;

  return {
    x: ((index * 37 + 9) % 96) / 100,
    y: upperRow ? -4 + ((index * 7) % 17) : 47 + ((index * 11) % 19),
    size: 1 + ((index * 5) % 4),
    driftX: -9 + ((index * 13) % 19),
    travelY: 5 + ((index * 7) % 15),
    delay: (index * 83) % 680,
    duration: 520 + ((index * 47) % 520),
    color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
  };
});

type Props = {onComplete: () => void};

/** Requires a continuous hold, then plays completion and optional particles. */
export const HoldToOrder = ({onComplete}: Props) => {
  const [width, setWidth] = useState(0);
  const [holding, setHolding] = useState(false);
  const [completed, setCompleted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0.7)).current;
  const shine = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const particleProgress = useRef(
    PARTICLES.map(() => new Animated.Value(0)),
  ).current;
  const holdingRef = useRef(false);
  const completedRef = useRef(false);
  const shineLoop = useRef<ReturnType<typeof Animated.loop> | null>(null);
  const glowLoop = useRef<ReturnType<typeof Animated.loop> | null>(null);
  const particleLoops = useRef<ReturnType<typeof Animated.loop>[]>([]);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      progress.stopAnimation();
      scale.stopAnimation();
      successScale.stopAnimation();
      shineLoop.current?.stop();
      glowLoop.current?.stop();
      particleLoops.current.forEach(animation => animation.stop());
      if (completionTimer.current) {
        clearTimeout(completionTimer.current);
      }
    },
    [progress, scale, successScale],
  );

  const finish = useCallback(() => {
    if (completedRef.current) {
      return;
    }

    holdingRef.current = false;
    completedRef.current = true;
    shineLoop.current?.stop();
    glowLoop.current?.stop();
    progress.setValue(1);
    setHolding(false);
    setCompleted(true);

    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        damping: 16,
        stiffness: 240,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.spring(successScale, {
          toValue: 1.12,
          damping: 12,
          stiffness: 260,
          useNativeDriver: true,
        }),
        Animated.spring(successScale, {
          toValue: 1,
          damping: 15,
          stiffness: 220,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(glowPulse, {
        toValue: 0.7,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    completionTimer.current = setTimeout(onComplete, 480);
  }, [glowPulse, onComplete, progress, scale, successScale]);

  const startHolding = useCallback(() => {
    if (!width || holdingRef.current || completedRef.current) {
      return;
    }

    holdingRef.current = true;
    setHolding(true);
    progress.setValue(0);
    shine.setValue(0);
    glowPulse.setValue(0.25);
    particleLoops.current.forEach(animation => animation.stop());
    particleProgress.forEach(value => value.setValue(0));

    shineLoop.current = Animated.loop(
      Animated.timing(shine, {
        toValue: 1,
        duration: 920,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    );
    glowLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 0.78,
          duration: 520,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0.3,
          duration: 520,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    shineLoop.current.start();
    glowLoop.current.start();
    if (ENABLE_PARTICLE_EFFECT) {
      particleLoops.current = particleProgress.map((value, index) => {
        const particle = PARTICLES[index];
        const animation = Animated.loop(
          Animated.sequence([
            Animated.delay(particle.delay),
            Animated.timing(value, {
              toValue: 1,
              duration: particle.duration,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0,
              duration: 180,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        );
        animation.start();
        return animation;
      });
    }

    Animated.spring(scale, {
      toValue: 0.985,
      damping: 18,
      stiffness: 280,
      useNativeDriver: true,
    }).start();

    Animated.timing(progress, {
      toValue: 1,
      duration: HOLD_DURATION,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished && holdingRef.current) {
        finish();
      }
    });
  }, [finish, glowPulse, particleProgress, progress, scale, shine, width]);

  const cancelHolding = useCallback(() => {
    if (!holdingRef.current || completedRef.current) {
      return;
    }

    holdingRef.current = false;
    setHolding(false);
    shineLoop.current?.stop();
    glowLoop.current?.stop();
    particleLoops.current.forEach(animation => animation.stop());
    particleProgress.forEach(value => {
      value.stopAnimation(currentValue => {
        Animated.timing(value, {
          toValue: 0,
          duration: Math.max(80, 180 * currentValue),
          useNativeDriver: true,
        }).start();
      });
    });
    progress.stopAnimation();

    Animated.parallel([
      Animated.timing(progress, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 1,
        damping: 18,
        stiffness: 260,
        useNativeDriver: true,
      }),
      Animated.timing(glowPulse, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [glowPulse, particleProgress, progress, scale]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const label = completed
    ? 'Order placed'
    : holding
    ? 'Keep holding...'
    : 'Hold to place order';

  const labelContent = (foreground = false) => (
    <View style={[styles.labelRow, width ? {width} : null]}>
      {completed && foreground ? (
        <Animated.View style={{transform: [{scale: successScale}]}}>
          <Check color={colors.background} size={18} strokeWidth={2.8} />
        </Animated.View>
      ) : null}
      <Text
        style={[
          styles.label,
          foreground && styles.foregroundLabel,
          completed && foreground && styles.completedLabel,
        ]}>
        {label}
      </Text>
    </View>
  );

  return (
    <Animated.View style={[styles.container, {transform: [{scale}]}]}>
      <Pressable
        accessibilityActions={[{name: 'activate', label: 'Place order'}]}
        accessibilityHint="Press and hold until the progress is complete"
        accessibilityLabel={label}
        accessibilityRole="button"
        hitSlop={4}
        onAccessibilityAction={event => {
          if (event.nativeEvent.actionName === 'activate') {
            finish();
          }
        }}
        onLayout={handleLayout}
        onPressIn={startHolding}
        onPressOut={cancelHolding}
        style={styles.track}>
        <View pointerEvents="none" style={styles.baseLabel}>
          {labelContent()}
        </View>

        <Animated.View
          pointerEvents="none"
          style={[
            styles.progressFill,
            completed && styles.completedFill,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, width],
              }),
            },
          ]}>
          {!completed ? (
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
                    opacity: glowPulse,
                    transform: [
                      {
                        translateX: shine.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-76, Math.max(0, width - 10)],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View style={[styles.glowHead, {opacity: glowPulse}]} />
            </>
          ) : (
            <Animated.View style={[styles.successGlow, {opacity: glowPulse}]} />
          )}
          {labelContent(true)}
        </Animated.View>
      </Pressable>
      {ENABLE_PARTICLE_EFFECT && (holding || completed) ? (
        <View pointerEvents="none" style={styles.particleField}>
          {PARTICLES.map((particle, index) => {
            const particleAnimation = particleProgress[index];

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
