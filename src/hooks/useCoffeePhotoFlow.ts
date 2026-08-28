import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Easing, PanResponder} from 'react-native';
import {
  PHOTO_SHAKE_TIMING,
  POLAROID_PRINT_MOTION,
  POLAROID_PRINT_TIMING,
} from '../animations/camera/photoPrintConfig';
import {useContinuousShakeDetection} from '../animations/camera/useContinuousShakeDetection';
import {saveCoffeePhoto} from '../services/photoLibrary';
import type {PhotoPhase} from '../types/camera';

const INITIAL_BLUR_RADIUS = 22;
const SAVE_ERROR_MESSAGE =
  'Could not save. Please allow photo access and try again.';

const springPhotoBack = (photoPull: Animated.Value) => {
  Animated.spring(photoPull, {
    toValue: 0,
    damping: 17,
    stiffness: 210,
    useNativeDriver: true,
  }).start();
};

/**
 * Coordinates the full post-capture state machine: printing, shake detection,
 * gradual development, discard, pull gesture, and system-album saving.
 *
 * COPY NOTES
 * - photoPhase is the state machine; render UI from the phase instead of adding
 *   separate booleans for every step.
 * - replace saveCoffeePhoto when the target project uses another media library.
 * - useContinuousShakeDetection owns raw accelerometer sampling.
 * - cardShake remains React Native Animated, so it can be copied independently.
 */
export const useCoffeePhotoFlow = () => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoNumber, setPhotoNumber] = useState(0);
  const [photoPhase, setPhotoPhase] = useState<PhotoPhase>('idle');
  const [blurRadius, setBlurRadius] = useState(INITIAL_BLUR_RADIUS);
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Keep one value per visual responsibility. This makes individual phases easy
  // to retime or copy without accidentally changing another effect.
  const photoProgress = useRef(new Animated.Value(0)).current;
  const developProgress = useRef(new Animated.Value(0)).current;
  const clarityProgress = useRef(new Animated.Value(0)).current;
  const cardShake = useRef(new Animated.Value(0)).current;
  const arrowBounce = useRef(new Animated.Value(0)).current;
  const photoPull = useRef(new Animated.Value(0)).current;
  const revealStarted = useRef(false);
  const savedMessageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Image blurRadius is a number prop, so bridge normalized clarity into state.
    const listener = clarityProgress.addListener(({value}) => {
      const nextBlur = Math.round((1 - value) * INITIAL_BLUR_RADIUS);
      setBlurRadius(current => (current === nextBlur ? current : nextBlur));
    });
    return () => clarityProgress.removeListener(listener);
  }, [clarityProgress]);

  useEffect(
    () => () => {
      if (savedMessageTimer.current) {
        clearTimeout(savedMessageTimer.current);
      }
    },
    [],
  );

  /** Plays exactly one card wobble for one accelerometer shake pulse. */
  const playCardShakePulse = useCallback(() => {
    cardShake.stopAnimation();
    cardShake.setValue(0);
    Animated.timing(cardShake, {
      toValue: 1,
      duration: PHOTO_SHAKE_TIMING.pulseAnimationDuration,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished) {
        cardShake.setValue(0);
      }
    });
  }, [cardShake]);

  /** Starts development only after the three-second card shake has completed. */
  const revealPhoto = useCallback(() => {
    if (revealStarted.current) {
      return;
    }

    revealStarted.current = true;
    cardShake.stopAnimation();
    cardShake.setValue(0);
    setPhotoPhase('revealing');

    // Then develop blur 22 -> 0 slowly, like instant film becoming visible.
    Animated.timing(clarityProgress, {
      toValue: 1,
      duration: PHOTO_SHAKE_TIMING.revealDuration,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished) {
        setPhotoPhase('readyToSave');
      }
    });
  }, [cardShake, clarityProgress]);

  const beginShakeActivity = useCallback(() => {
    setPhotoPhase(current =>
      current === 'waitingForShake' ? 'shaking' : current,
    );
  }, []);

  const resetShakeActivity = useCallback(() => {
    setPhotoPhase(current =>
      current === 'shaking' ? 'waitingForShake' : current,
    );
  }, []);

  const shakeProgress = useContinuousShakeDetection({
    active: photoPhase === 'waitingForShake' || photoPhase === 'shaking',
    onActivityStart: beginShakeActivity,
    onActivityReset: resetShakeActivity,
    onShakePulse: playCardShakePulse,
    onComplete: revealPhoto,
  });

  useEffect(() => {
    if (photoPhase !== 'readyToSave') {
      arrowBounce.stopAnimation();
      arrowBounce.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowBounce, {
          toValue: 1,
          duration: 620,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(arrowBounce, {
          toValue: 0,
          duration: 620,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [arrowBounce, photoPhase]);

  const showSavedMessage = useCallback(() => {
    if (savedMessageTimer.current) {
      clearTimeout(savedMessageTimer.current);
    }
    setSavedMessageVisible(true);
    savedMessageTimer.current = setTimeout(
      () => setSavedMessageVisible(false),
      2400,
    );
  }, []);

  /** Persists the current photo after a committed downward pull. */
  const savePhoto = useCallback(async () => {
    if (!photoUri || photoPhase !== 'readyToSave') {
      return;
    }

    setPhotoPhase('saving');
    setSaveError(null);

    try {
      await saveCoffeePhoto(photoUri);
      Animated.timing(photoPull, {
        toValue: 680,
        duration: 520,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start(({finished}) => {
        if (!finished) {
          return;
        }
        setPhotoUri(null);
        setPhotoPhase('idle');
        photoPull.setValue(0);
        showSavedMessage();
      });
    } catch {
      setPhotoPhase('readyToSave');
      setSaveError(SAVE_ERROR_MESSAGE);
      springPhotoBack(photoPull);
    }
  }, [photoPhase, photoPull, photoUri, showSavedMessage]);

  const stopPhotoAnimations = useCallback(() => {
    photoProgress.stopAnimation();
    developProgress.stopAnimation();
    clarityProgress.stopAnimation();
    cardShake.stopAnimation();
    arrowBounce.stopAnimation();
    photoPull.stopAnimation();
  }, [
    arrowBounce,
    cardShake,
    clarityProgress,
    developProgress,
    photoProgress,
    photoPull,
  ]);

  const resetPhotoAnimations = useCallback(() => {
    photoProgress.setValue(0);
    developProgress.setValue(0);
    clarityProgress.setValue(0);
    cardShake.setValue(0);
    arrowBounce.setValue(0);
    photoPull.setValue(0);
  }, [
    arrowBounce,
    cardShake,
    clarityProgress,
    developProgress,
    photoProgress,
    photoPull,
  ]);

  /** Stops every active animation and returns to the empty camera state. */
  const discardPhoto = useCallback(() => {
    if (photoPhase === 'saving') {
      return;
    }

    stopPhotoAnimations();
    resetPhotoAnimations();
    revealStarted.current = false;
    setPhotoUri(null);
    setPhotoPhase('idle');
    setBlurRadius(INITIAL_BLUR_RADIUS);
    setSaveError(null);
  }, [photoPhase, resetPhotoAnimations, stopPhotoAnimations]);

  /** Resets old values and starts the physical print/development animation. */
  const handleCapture = useCallback(
    (capturedUri: string) => {
      setPhotoNumber(current => current + 1);
      setPhotoUri(capturedUri);
      setPhotoPhase('printing');
      setBlurRadius(INITIAL_BLUR_RADIUS);
      setSaveError(null);
      revealStarted.current = false;
      resetPhotoAnimations();

      // Printing and paper development overlap but start at different delays.
      Animated.parallel([
        Animated.sequence([
          Animated.delay(POLAROID_PRINT_TIMING.ejectDelay),
          Animated.timing(photoProgress, {
            // First expose the whole card at an intentionally oversized pose.
            toValue: POLAROID_PRINT_MOTION.ejectProgress,
            duration: POLAROID_PRINT_TIMING.ejectDuration,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(photoProgress, {
            // Then shrink and rotate into the final resting pose.
            toValue: 1,
            duration: POLAROID_PRINT_TIMING.settleDuration,
            easing: Easing.out(Easing.back(1.35)),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(POLAROID_PRINT_TIMING.developDelay),
          Animated.timing(developProgress, {
            toValue: 1,
            duration: POLAROID_PRINT_TIMING.developDuration,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]).start(({finished}) => {
        if (finished) {
          setPhotoPhase('waitingForShake');
        }
      });
    },
    [developProgress, photoProgress, resetPhotoAnimations],
  );

  const photoPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture) =>
          photoPhase === 'readyToSave' &&
          gesture.dy > 4 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) =>
          photoPull.setValue(Math.max(0, gesture.dy)),
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 105 || (gesture.dy > 45 && gesture.vy > 1.1)) {
            savePhoto();
            return;
          }
          springPhotoBack(photoPull);
        },
        onPanResponderTerminate: () => springPhotoBack(photoPull),
      }),
    [photoPhase, photoPull, savePhoto],
  );

  return {
    photoUri,
    photoNumber,
    photoPhase,
    blurRadius,
    saveError,
    savedMessageVisible,
    shakeProgress,
    photoProgress,
    developProgress,
    cardShake,
    arrowBounce,
    photoPull,
    photoPanHandlers: photoPanResponder.panHandlers,
    handleCapture,
    discardPhoto,
  };
};
