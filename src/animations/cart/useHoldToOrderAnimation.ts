import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Easing} from 'react-native';
import {HOLD_PARTICLES, HOLD_PARTICLES_ENABLED} from './holdToOrderParticles';

const HOLD_DURATION = 4500;

type Options = {onComplete: () => void; width: number};

/**
 * Reusable hold-to-confirm controller.
 *
 * COPY NOTES
 * - progress drives the left-to-right fill and intentionally uses the JS driver
 *   because width cannot use the native driver.
 * - scale, shine, glow and particles only use transform/opacity, so they use the
 *   native driver for smoother frames.
 * - connect startHolding/cancelHolding to Pressable onPressIn/onPressOut.
 */
export const useHoldToOrderAnimation = ({onComplete, width}: Options) => {
  const [holding, setHolding] = useState(false);
  const [completed, setCompleted] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const successScale = useRef(new Animated.Value(0.7)).current;
  const shine = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const particleProgress = useRef(
    HOLD_PARTICLES.map(() => new Animated.Value(0)),
  ).current;

  // Refs guard against duplicate native events without waiting for React state.
  const holdingRef = useRef(false);
  const completedRef = useRef(false);
  const shineLoop = useRef<ReturnType<typeof Animated.loop> | null>(null);
  const glowLoop = useRef<ReturnType<typeof Animated.loop> | null>(null);
  const particleLoops = useRef<ReturnType<typeof Animated.loop>[]>([]);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Infinite loops and delayed callbacks must be cleaned up on unmount.
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

    // Completion combines a button settle, checkmark pop and final glow flash.
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

    // This repeating sweep produces the bright band crossing the filled area.
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

    if (HOLD_PARTICLES_ENABLED) {
      particleLoops.current = particleProgress.map((value, index) => {
        const particle = HOLD_PARTICLES[index];
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

    // Slight compression makes the long press feel physically engaged.
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

    // Fade each particle from its current point instead of snapping it away.
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

  return {
    cancelHolding,
    completed,
    finish,
    glowPulse,
    holding,
    particleProgress,
    progress,
    scale,
    shine,
    startHolding,
    successScale,
  };
};
