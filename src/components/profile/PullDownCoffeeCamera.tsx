import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Camera as CameraIcon,
  RefreshCcw,
  ShieldAlert,
  Zap,
  ZapOff,
} from 'lucide-react-native';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Camera,
  type CameraPosition,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {colors} from '../../theme';

const COLLAPSED_WIDTH = 154;
const COLLAPSED_HEIGHT = 48;

type Props = {onCapture: (photoUri: string) => void};

export type PullDownCoffeeCameraHandle = {
  beginPull: () => void;
  movePull: (distanceY: number) => void;
  endPull: (velocityY: number) => void;
  cancelPull: () => void;
};

export const PullDownCoffeeCamera = forwardRef<
  PullDownCoffeeCameraHandle,
  Props
>(({onCapture}, ref) => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const expandedWidth = Math.min(screenWidth - 24, 430);
  const expandedHeight = Math.min(screenHeight - 104, 640);
  const dragDistance = Math.max(320, Math.min(screenHeight * 0.46, 420));
  const camera = useRef<Camera>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const shutterScale = useRef(new Animated.Value(1)).current;
  const flashOverlay = useRef(new Animated.Value(0)).current;
  const currentProgress = useRef(0);
  const gestureStart = useRef(0);
  const isOpen = useRef(false);
  const isCapturing = useRef(false);
  const permissionRequested = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [controlsEnabled, setControlsEnabled] = useState(false);
  const [position, setPosition] = useState<CameraPosition>('back');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice(position);
  const canUseFlash = position === 'back' && Boolean(device?.hasFlash);

  useEffect(() => {
    const listener = progress.addListener(({value}) => {
      currentProgress.current = value;
    });
    return () => progress.removeListener(listener);
  }, [progress]);

  useEffect(() => {
    if (!permissionRequested.current && !hasPermission) {
      permissionRequested.current = true;
      requestPermission().catch(() =>
        setCameraError('Camera permission is required.'),
      );
    }
  }, [hasPermission, requestPermission]);

  useEffect(() => {
    if (!canUseFlash) {
      setFlashEnabled(false);
    }
  }, [canUseFlash]);

  const animateCamera = useCallback(
    (open: boolean, velocity = 0, printing = false) => {
      isOpen.current = open;
      if (open) {
        setCameraActive(true);
        setControlsEnabled(true);
      }

      if (!open && printing) {
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

  const beginPull = useCallback(() => {
    gestureStart.current = currentProgress.current;
    progress.stopAnimation();
    setCameraActive(true);
  }, [progress]);

  const movePull = useCallback(
    (distanceY: number) => {
      const next = gestureStart.current + distanceY / dragDistance;
      progress.setValue(Math.max(0, Math.min(1, next)));
    },
    [dragDistance, progress],
  );

  const endPull = useCallback(
    (velocityY: number) => {
      const reachedBottom = currentProgress.current >= 0.72;
      const committedFlick = velocityY > 1.15 && currentProgress.current > 0.42;
      animateCamera(reachedBottom || committedFlick, velocityY / 9);
    },
    [animateCamera],
  );

  const cancelPull = useCallback(
    () => animateCamera(currentProgress.current >= 0.72),
    [animateCamera],
  );

  useImperativeHandle(ref, () => ({beginPull, movePull, endPull, cancelPull}), [
    beginPull,
    cancelPull,
    endPull,
    movePull,
  ]);

  const toggleCamera = useCallback(() => {
    setCameraError(null);
    setPosition(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  const takePhoto = useCallback(async () => {
    if (!camera.current || !device || isCapturing.current || !isOpen.current) {
      return;
    }

    isCapturing.current = true;
    setCameraError(null);
    Animated.sequence([
      Animated.spring(shutterScale, {
        toValue: 0.78,
        damping: 18,
        stiffness: 430,
        useNativeDriver: true,
      }),
      Animated.spring(shutterScale, {
        toValue: 1,
        damping: 15,
        stiffness: 300,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const photo = await camera.current.takePhoto({
        flash: flashEnabled && canUseFlash ? 'on' : 'off',
        qualityPrioritization: 'speed',
      });
      const photoUri = photo.path.startsWith('file://')
        ? photo.path
        : `file://${photo.path}`;

      Animated.sequence([
        Animated.timing(flashOverlay, {
          toValue: 1,
          duration: 55,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(flashOverlay, {
          toValue: 0,
          duration: 190,
          useNativeDriver: true,
        }),
      ]).start();

      onCapture(photoUri);
      animateCamera(false, -0.16, true);
    } catch {
      setCameraError('Photo could not be taken. Please try again.');
    } finally {
      isCapturing.current = false;
    }
  }, [
    animateCamera,
    canUseFlash,
    device,
    flashEnabled,
    flashOverlay,
    onCapture,
    shutterScale,
  ]);

  const panelWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_WIDTH, expandedWidth],
  });
  const panelHeight = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [COLLAPSED_HEIGHT, expandedHeight],
  });
  const panelRadius = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 34],
  });
  const contentOpacity = progress.interpolate({
    inputRange: [0, 0.16, 0.46, 1],
    outputRange: [0, 0, 0.72, 1],
  });
  const notchOpacity = progress.interpolate({
    inputRange: [0, 0.18, 1],
    outputRange: [1, 0, 0],
  });
  const pullIndicatorOpacity = progress.interpolate({
    inputRange: [0, 0.35, 0.92, 1],
    outputRange: [0, 0.55, 1, 0],
  });

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <Animated.View
        style={[
          styles.cameraBody,
          {width: panelWidth, height: panelHeight, borderRadius: panelRadius},
        ]}>
        <Pressable
          accessibilityHint="Drag this control down to the bottom to open the camera"
          accessibilityLabel="Pull down camera"
          accessibilityRole="button"
          onPress={() => animateCamera(!isOpen.current)}
          style={styles.notchButton}>
          <Animated.View style={[styles.notchContent, {opacity: notchOpacity}]}>
            <View style={styles.notchLens}>
              <View style={styles.notchLensGlint} />
            </View>
            <CameraIcon color={colors.goldSoft} size={15} strokeWidth={1.8} />
            <Text style={styles.notchLabel}>PULL DOWN</Text>
          </Animated.View>
        </Pressable>

        <Animated.View
          pointerEvents={controlsEnabled ? 'auto' : 'none'}
          style={[styles.cameraContent, {opacity: contentOpacity}]}>
          <View style={styles.cameraTopRow}>
            <View>
              <Text style={styles.brand}>NOIR COFFEE</Text>
              <Text style={styles.cameraMode}>
                {position === 'front' ? 'SELFIE CAMERA' : 'MEMORY CAMERA'}
              </Text>
            </View>
            <View style={styles.statusLight} />
          </View>

          <View style={styles.viewfinderShell}>
            <View style={styles.viewfinder}>
              {hasPermission && device ? (
                <Camera
                  ref={camera}
                  device={device}
                  isActive={cameraActive}
                  onError={error => setCameraError(error.message)}
                  photo
                  style={StyleSheet.absoluteFill}
                />
              ) : (
                <View style={styles.permissionState}>
                  <ShieldAlert
                    color={colors.gold}
                    size={28}
                    strokeWidth={1.5}
                  />
                  <Text style={styles.permissionTitle}>
                    {hasPermission ? 'Finding camera…' : 'Camera access needed'}
                  </Text>
                  {!hasPermission && (
                    <Pressable
                      onPress={requestPermission}
                      style={styles.permissionButton}>
                      <Text style={styles.permissionButtonText}>
                        ALLOW CAMERA
                      </Text>
                    </Pressable>
                  )}
                </View>
              )}
              <View pointerEvents="none" style={styles.focusFrame}>
                <View style={[styles.focusCorner, styles.focusTopLeft]} />
                <View style={[styles.focusCorner, styles.focusTopRight]} />
                <View style={[styles.focusCorner, styles.focusBottomLeft]} />
                <View style={[styles.focusCorner, styles.focusBottomRight]} />
              </View>
              <View pointerEvents="none" style={styles.exposureBadge}>
                <Text style={styles.exposureText}>
                  {position === 'front'
                    ? 'FRONT'
                    : flashEnabled
                    ? 'FLASH ON'
                    : 'FLASH OFF'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.controls}>
            <Pressable
              accessibilityLabel={
                flashEnabled ? 'Turn flash off' : 'Turn flash on'
              }
              accessibilityRole="button"
              disabled={!canUseFlash}
              onPress={() => setFlashEnabled(current => !current)}
              style={({pressed}) => [
                styles.sideControl,
                flashEnabled && styles.sideControlActive,
                !canUseFlash && styles.sideControlDisabled,
                pressed && styles.controlPressed,
              ]}>
              {flashEnabled ? (
                <Zap
                  color={colors.background}
                  fill={colors.background}
                  size={18}
                />
              ) : (
                <ZapOff color={colors.goldSoft} size={18} strokeWidth={1.7} />
              )}
            </Pressable>

            <Pressable
              accessibilityLabel="Take photo"
              accessibilityRole="button"
              disabled={!hasPermission || !device}
              onPress={takePhoto}>
              <Animated.View
                style={[
                  styles.shutterOuter,
                  {transform: [{scale: shutterScale}]},
                ]}>
                <View style={styles.shutterInner} />
              </Animated.View>
            </Pressable>

            <Pressable
              accessibilityLabel="Switch front or back camera"
              accessibilityRole="button"
              onPress={toggleCamera}
              style={({pressed}) => [
                styles.sideControl,
                pressed && styles.controlPressed,
              ]}>
              <RefreshCcw color={colors.goldSoft} size={18} strokeWidth={1.7} />
            </Pressable>
          </View>
          <Text style={styles.cameraHint}>
            {cameraError ?? 'PRESS THE SHUTTER TO PRINT'}
          </Text>
        </Animated.View>

        <Animated.View
          pointerEvents="none"
          style={[styles.pullIndicator, {opacity: pullIndicatorOpacity}]}>
          <View style={styles.pullIndicatorBar} />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[styles.flashOverlay, {opacity: flashOverlay}]}
        />
      </Animated.View>
    </View>
  );
});

PullDownCoffeeCamera.displayName = 'PullDownCoffeeCamera';

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 8,
    alignItems: 'center',
  },
  cameraBody: {
    marginTop: 5,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.gold,
    overflow: 'hidden',
    shadowColor: colors.goldSoft,
    shadowOpacity: 0.28,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 9},
    elevation: 16,
  },
  notchButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: COLLAPSED_HEIGHT,
    zIndex: 3,
  },
  notchContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  notchLens: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: '#08080A',
    alignItems: 'flex-end',
    padding: 3,
  },
  notchLensGlint: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.cream,
  },
  notchLabel: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.gold,
  },
  cameraContent: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 17,
    paddingBottom: 13,
  },
  cameraTopRow: {
    height: 48,
    paddingLeft: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.cream,
  },
  cameraMode: {
    marginTop: 3,
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 1,
    color: colors.gold,
  },
  statusLight: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.goldSoft,
    shadowColor: colors.goldSoft,
    shadowOpacity: 1,
    shadowRadius: 7,
  },
  viewfinderShell: {
    flex: 1,
    minHeight: 210,
    borderRadius: 28,
    borderWidth: 6,
    borderColor: '#09090A',
    backgroundColor: colors.elevated,
    padding: 5,
  },
  viewfinder: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#09090A',
  },
  permissionState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.elevated,
  },
  permissionTitle: {
    marginTop: 9,
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  permissionButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  permissionButtonText: {
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: colors.goldSoft,
  },
  focusFrame: {
    position: 'absolute',
    width: 106,
    height: 106,
    left: '50%',
    top: '50%',
    marginLeft: -53,
    marginTop: -53,
  },
  focusCorner: {
    position: 'absolute',
    width: 19,
    height: 19,
    borderColor: colors.cream,
  },
  focusTopLeft: {top: 0, left: 0, borderTopWidth: 1, borderLeftWidth: 1},
  focusTopRight: {top: 0, right: 0, borderTopWidth: 1, borderRightWidth: 1},
  focusBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  focusBottomRight: {
    right: 0,
    bottom: 0,
    borderRightWidth: 1,
    borderBottomWidth: 1,
  },
  exposureBadge: {
    position: 'absolute',
    left: 9,
    bottom: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(10,10,12,0.72)',
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  exposureText: {
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: colors.goldSoft,
  },
  controls: {
    height: 104,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 38,
  },
  sideControl: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideControlActive: {
    backgroundColor: colors.gold,
    borderColor: colors.goldSoft,
  },
  sideControlDisabled: {opacity: 0.3},
  controlPressed: {transform: [{scale: 0.9}]},
  shutterOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: colors.goldSoft,
    backgroundColor: '#0D0D0F',
    padding: 7,
    shadowColor: colors.gold,
    shadowOpacity: 0.55,
    shadowRadius: 10,
  },
  shutterInner: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: colors.cream,
  },
  cameraHint: {
    height: 16,
    textAlign: 'center',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.muted,
  },
  pullIndicator: {
    position: 'absolute',
    bottom: 7,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pullIndicatorBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.goldSoft,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.cream,
  },
});
