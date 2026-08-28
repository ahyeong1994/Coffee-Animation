import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Easing, PanResponder} from 'react-native';
import RNShake from 'react-native-shake';
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
 * - RNShake is the only sensor dependency; all motion uses React Native Animated.
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

  /** Starts one reveal sequence and ignores duplicate shake events. */
  const revealPhoto = useCallback(() => {
    if (revealStarted.current) {
      return;
    }

    revealStarted.current = true;
    setPhotoPhase('revealing');

    // A tiny horizontal shake acknowledges the physical device shake first.
    Animated.sequence([
      Animated.timing(cardShake, {
        toValue: 1,
        duration: 75,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(cardShake, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.elastic(2.2)),
        useNativeDriver: true,
      }),
    ]).start();

    // Then develop blur 22 -> 0 slowly, like instant film becoming visible.
    Animated.timing(clarityProgress, {
      toValue: 1,
      duration: 2200,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished) {
        setPhotoPhase('readyToSave');
      }
    });
  }, [cardShake, clarityProgress]);

  useEffect(() => {
    if (photoPhase !== 'waitingForShake') {
      return;
    }

    const subscription = RNShake.addListener(revealPhoto);
    return () => subscription.remove();
  }, [photoPhase, revealPhoto]);

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
          Animated.delay(360),
          Animated.timing(photoProgress, {
            toValue: 0.82,
            duration: 1150,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(photoProgress, {
            toValue: 1,
            damping: 18,
            stiffness: 95,
            mass: 1.05,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(760),
          Animated.timing(developProgress, {
            toValue: 1,
            duration: 1450,
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
