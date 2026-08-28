import {useCallback, useEffect, useRef, useState} from 'react';
import {Animated, Easing} from 'react-native';
import {
  Camera,
  type CameraPosition,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import {CAMERA_CAPTURE_TIMING} from '../../animations/camera/photoPrintConfig';

const wait = (duration: number) =>
  new Promise<void>(resolve => setTimeout(resolve, duration));

type Options = {
  isCameraOpen: React.MutableRefObject<boolean>;
  closeCameraAfterCapture: () => void;
  onCapture: (photoUri: string) => void;
};

/**
 * Owns all native camera behavior: permission, lens selection, flash state,
 * shutter feedback, and converting VisionCamera paths into file URIs.
 * COPY NOTE: the animation values are renderer-agnostic, but capture requires
 * react-native-vision-camera and its native permission configuration.
 */
export const useCameraCapture = ({
  isCameraOpen,
  closeCameraAfterCapture,
  onCapture,
}: Options) => {
  const cameraRef = useRef<Camera>(null);
  const shutterScale = useRef(new Animated.Value(1)).current;
  const shutterLoadingRotation = useRef(new Animated.Value(0)).current;
  const flashOverlay = useRef(new Animated.Value(0)).current;
  const capturingRef = useRef(false);
  const permissionRequested = useRef(false);
  const [position, setPosition] = useState<CameraPosition>('back');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const {hasPermission, requestPermission} = useCameraPermission();
  const device = useCameraDevice(position);
  const canUseFlash = position === 'back' && Boolean(device?.hasFlash);

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

  useEffect(() => {
    shutterLoadingRotation.stopAnimation();
    shutterLoadingRotation.setValue(0);
    if (!isCapturing) {
      return;
    }

    // Rotate a custom ring while native camera capture is still in progress.
    const loadingLoop = Animated.loop(
      Animated.timing(shutterLoadingRotation, {
        toValue: 1,
        duration: CAMERA_CAPTURE_TIMING.loadingRotationDuration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loadingLoop.start();
    return () => loadingLoop.stop();
  }, [isCapturing, shutterLoadingRotation]);

  /** Switches between the front and rear devices and clears old errors. */
  const toggleCamera = useCallback(() => {
    setCameraError(null);
    setPosition(current => (current === 'back' ? 'front' : 'back'));
  }, []);

  /** Toggles flash only when the selected physical camera supports it. */
  const toggleFlash = useCallback(() => {
    if (canUseFlash) {
      setFlashEnabled(current => !current);
    }
  }, [canUseFlash]);

  /** Captures one image and starts shutter/flash feedback animations. */
  const takePhoto = useCallback(async () => {
    if (
      !cameraRef.current ||
      !device ||
      capturingRef.current ||
      !isCameraOpen.current
    ) {
      return;
    }

    capturingRef.current = true;
    setIsCapturing(true);
    setCameraError(null);

    // Compress and rebound the shutter immediately, before native capture ends.
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
      // Promise.all keeps the loading ring visible long enough to be readable,
      // while still waiting longer when the real camera capture needs more time.
      const [photo] = await Promise.all([
        cameraRef.current.takePhoto({
          flash: flashEnabled && canUseFlash ? 'on' : 'off',
          qualityPrioritization: 'speed',
        }),
        wait(CAMERA_CAPTURE_TIMING.minimumLoadingDuration),
      ]);
      const photoUri = photo.path.startsWith('file://')
        ? photo.path
        : `file://${photo.path}`;

      // A very short white overlay simulates the physical camera flash.
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

      setIsCapturing(false);
      onCapture(photoUri);
      closeCameraAfterCapture();
    } catch {
      setCameraError('Photo could not be taken. Please try again.');
    } finally {
      capturingRef.current = false;
      setIsCapturing(false);
    }
  }, [
    canUseFlash,
    closeCameraAfterCapture,
    device,
    flashEnabled,
    flashOverlay,
    isCameraOpen,
    onCapture,
    shutterScale,
  ]);

  return {
    cameraRef,
    shutterScale,
    shutterLoadingRotation,
    flashOverlay,
    position,
    flashEnabled,
    cameraError,
    isCapturing,
    hasPermission,
    device,
    canUseFlash,
    requestPermission,
    setCameraError,
    toggleCamera,
    toggleFlash,
    takePhoto,
  };
};
