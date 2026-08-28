import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Easing} from 'react-native';

export const PULL_DOWN_CAMERA_SIZE = {
  collapsedWidth: 154,
  collapsedHeight: 48,
  printerWidth: 214,
  printerHeight: 19,
  maxWidth: 430,
  maxHeight: 640,
} as const;

type Options = {
  screenWidth: number;
  screenHeight: number;
  printing?: boolean;
  printerWidth?: number;
};

/**
 * Controls a panel that expands from a compact notch into a full camera.
 * The returned gesture functions are UI-agnostic and can be connected to any
 * PanResponder, gesture-handler, or imperative ref in another project.
 *
 * COPY NOTES
 * - progress is normalized: 0 means notch, 1 means open camera.
 * - width/height/radius require useNativeDriver false in animateCamera.
 * - cameraActive mounts hardware early; controlsEnabled hides controls while
 *   the slower photo-print close animation is running.
 */
export const usePullDownCameraAnimation = ({
  screenWidth,
  screenHeight,
  printing = false,
  printerWidth = PULL_DOWN_CAMERA_SIZE.printerWidth,
}: Options) => {
  const progress = useRef(new Animated.Value(0)).current;
  const printerMorph = useRef(new Animated.Value(0)).current;
  const currentProgress = useRef(0);
  const gestureStart = useRef(0);
  const isOpen = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(false);

  const expandedWidth = Math.min(
    screenWidth - 24,
    PULL_DOWN_CAMERA_SIZE.maxWidth,
  );
  const expandedHeight = Math.min(
    screenHeight - 104,
    PULL_DOWN_CAMERA_SIZE.maxHeight,
  );
  // Clamp drag distance so the gesture feels similar on small and large phones.
  const dragDistance = Math.max(320, Math.min(screenHeight * 0.46, 420));

  useEffect(() => {
    const listener = progress.addListener(({value}) => {
      currentProgress.current = value;
    });
    return () => progress.removeListener(listener);
  }, [progress]);

  useEffect(() => {
    printerMorph.stopAnimation();
    const morph = printing
      ? Animated.sequence([
          // Let the full camera nearly collapse before reshaping its header.
          Animated.delay(420),
          Animated.timing(printerMorph, {
            toValue: 1,
            duration: 360,
            easing: Easing.inOut(Easing.cubic),
            useNativeDriver: false,
          }),
        ])
      : Animated.timing(printerMorph, {
          toValue: 0,
          duration: 340,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        });

    morph.start();
    return () => morph.stop();
  }, [printerMorph, printing]);

  /** Opens or closes the panel, optionally using the slower print transition. */
  const animateCamera = useCallback(
    (open: boolean, velocity = 0, printingPhoto = false) => {
      isOpen.current = open;

      if (open) {
        setCameraActive(true);
        setControlsEnabled(true);
      }

      if (!open && printingPhoto) {
        setControlsEnabled(false);
        Animated.timing(progress, {
          toValue: 0,
          duration: 680,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false,
        }).start(({finished}) => {
          if (finished) {
            setCameraActive(false);
          }
        });
        return;
      }

      Animated.spring(progress, {
        toValue: open ? 1 : 0,
        damping: open ? 18 : 21,
        stiffness: open ? 165 : 205,
        mass: 0.88,
        velocity,
        overshootClamping: false,
        useNativeDriver: false,
      }).start(({finished}) => {
        if (finished && !open) {
          setCameraActive(false);
          setControlsEnabled(false);
        }
      });
    },
    [progress],
  );

  /** Records the current panel position when a pull gesture begins. */
  const beginPull = useCallback(() => {
    gestureStart.current = currentProgress.current;
    progress.stopAnimation();
    setCameraActive(true);
  }, [progress]);

  /** Maps the user's vertical drag distance to normalized panel progress. */
  const movePull = useCallback(
    (distanceY: number) => {
      const next = gestureStart.current + distanceY / dragDistance;
      progress.setValue(Math.max(0, Math.min(1, next)));
    },
    [dragDistance, progress],
  );

  /** Commits the open state after reaching the threshold or a fast flick. */
  const endPull = useCallback(
    (velocityY: number) => {
      const reachedBottom = currentProgress.current >= 0.72;
      const committedFlick = velocityY > 1.15 && currentProgress.current > 0.42;
      animateCamera(reachedBottom || committedFlick, velocityY / 9);
    },
    [animateCamera],
  );

  /** Settles an interrupted gesture at its nearest logical state. */
  const cancelPull = useCallback(
    () => animateCamera(currentProgress.current >= 0.72),
    [animateCamera],
  );

  const basePanelWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [PULL_DOWN_CAMERA_SIZE.collapsedWidth, expandedWidth],
  });
  const basePanelHeight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [PULL_DOWN_CAMERA_SIZE.collapsedHeight, expandedHeight],
  });
  const basePanelRadius = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 34],
  });
  const notchOpacity = progress.interpolate({
    inputRange: [0, 0.18, 1],
    outputRange: [1, 0, 0],
  });

  return {
    progress,
    isOpen,
    cameraActive,
    controlsEnabled,
    animateCamera,
    beginPull,
    movePull,
    endPull,
    cancelPull,
    // The same panel becomes the printer slot instead of rendering a second box.
    panelWidth: Animated.add(
      basePanelWidth,
      printerMorph.interpolate({
        inputRange: [0, 1],
        outputRange: [0, printerWidth - PULL_DOWN_CAMERA_SIZE.collapsedWidth],
      }),
    ),
    panelHeight: Animated.add(
      basePanelHeight,
      printerMorph.interpolate({
        inputRange: [0, 1],
        outputRange: [
          0,
          PULL_DOWN_CAMERA_SIZE.printerHeight -
            PULL_DOWN_CAMERA_SIZE.collapsedHeight,
        ],
      }),
    ),
    panelRadius: Animated.add(
      basePanelRadius,
      printerMorph.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -14],
      }),
    ),
    contentOpacity: progress.interpolate({
      inputRange: [0, 0.16, 0.46, 1],
      outputRange: [0, 0, 0.72, 1],
    }),
    notchOpacity: Animated.multiply(
      notchOpacity,
      printerMorph.interpolate({
        inputRange: [0, 0.28, 1],
        outputRange: [1, 0, 0],
      }),
    ),
    printerOpacity: printerMorph.interpolate({
      inputRange: [0, 0.45, 1],
      outputRange: [0, 0, 1],
    }),
    pullIndicatorOpacity: progress.interpolate({
      inputRange: [0, 0.35, 0.92, 1],
      outputRange: [0, 0.55, 1, 0],
    }),
  };
};
