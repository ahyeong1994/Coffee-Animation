import React, {forwardRef, useCallback, useImperativeHandle} from 'react';
import {Camera as CameraIcon} from 'lucide-react-native';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  PULL_DOWN_CAMERA_SIZE,
  usePullDownCameraAnimation,
} from '../../animations/camera/usePullDownCameraAnimation';
import {useCameraCapture} from '../../hooks/camera/useCameraCapture';
import {colors} from '../../theme';
import {PullDownCameraContent} from './camera/PullDownCameraContent';

type Props = {onCapture: (photoUri: string) => void};

export type PullDownCoffeeCameraHandle = {
  beginPull: () => void;
  movePull: (distanceY: number) => void;
  endPull: (velocityY: number) => void;
  cancelPull: () => void;
};

/**
 * Combines the reusable pull-down panel animation with native camera capture.
 * Parent screens control its gesture through the exposed imperative handle.
 */
export const PullDownCoffeeCamera = forwardRef<
  PullDownCoffeeCameraHandle,
  Props
>(({onCapture}, ref) => {
  const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  const panel = usePullDownCameraAnimation({screenWidth, screenHeight});
  const {animateCamera} = panel;

  const closeCameraAfterCapture = useCallback(
    () => animateCamera(false, -0.16, true),
    [animateCamera],
  );
  const capture = useCameraCapture({
    isCameraOpen: panel.isOpen,
    closeCameraAfterCapture,
    onCapture,
  });

  useImperativeHandle(
    ref,
    () => ({
      beginPull: panel.beginPull,
      movePull: panel.movePull,
      endPull: panel.endPull,
      cancelPull: panel.cancelPull,
    }),
    [panel.beginPull, panel.cancelPull, panel.endPull, panel.movePull],
  );

  return (
    <View pointerEvents="box-none" style={styles.layer}>
      <Animated.View
        style={[
          styles.cameraBody,
          {
            width: panel.panelWidth,
            height: panel.panelHeight,
            borderRadius: panel.panelRadius,
          },
        ]}>
        <Pressable
          accessibilityHint="Drag this control down to the bottom to open the camera"
          accessibilityLabel="Pull down camera"
          accessibilityRole="button"
          onPress={() => animateCamera(!panel.isOpen.current)}
          style={styles.notchButton}>
          <Animated.View
            style={[styles.notchContent, {opacity: panel.notchOpacity}]}>
            <View style={styles.notchLens}>
              <View style={styles.notchLensGlint} />
            </View>
            <CameraIcon color={colors.goldSoft} size={15} strokeWidth={1.8} />
            <Text style={styles.notchLabel}>PULL DOWN</Text>
          </Animated.View>
        </Pressable>

        <PullDownCameraContent
          cameraActive={panel.cameraActive}
          cameraError={capture.cameraError}
          cameraRef={capture.cameraRef}
          canUseFlash={capture.canUseFlash}
          contentOpacity={panel.contentOpacity}
          controlsEnabled={panel.controlsEnabled}
          device={capture.device}
          flashEnabled={capture.flashEnabled}
          hasPermission={capture.hasPermission}
          onCameraError={capture.setCameraError}
          onRequestPermission={capture.requestPermission}
          onTakePhoto={capture.takePhoto}
          onToggleCamera={capture.toggleCamera}
          onToggleFlash={capture.toggleFlash}
          position={capture.position}
          shutterScale={capture.shutterScale}
        />

        <Animated.View
          pointerEvents="none"
          style={[styles.pullIndicator, {opacity: panel.pullIndicatorOpacity}]}>
          <View style={styles.pullIndicatorBar} />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[styles.flashOverlay, {opacity: capture.flashOverlay}]}
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
    height: PULL_DOWN_CAMERA_SIZE.collapsedHeight,
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
