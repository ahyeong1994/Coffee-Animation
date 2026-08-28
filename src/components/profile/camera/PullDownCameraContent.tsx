import React from 'react';
import {RefreshCcw, ShieldAlert, Zap, ZapOff} from 'lucide-react-native';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {
  Camera,
  type CameraDevice,
  type CameraPosition,
} from 'react-native-vision-camera';
import {colors} from '../../../theme';

type Props = {
  cameraRef: React.RefObject<Camera>;
  cameraActive: boolean;
  controlsEnabled: boolean;
  contentOpacity: Animated.AnimatedInterpolation<number>;
  device: CameraDevice | undefined;
  hasPermission: boolean;
  position: CameraPosition;
  flashEnabled: boolean;
  canUseFlash: boolean;
  cameraError: string | null;
  isCapturing: boolean;
  shutterScale: Animated.Value;
  shutterLoadingRotation: Animated.Value;
  onCameraError: (message: string) => void;
  onRequestPermission: () => Promise<boolean>;
  onToggleFlash: () => void;
  onTakePhoto: () => void;
  onToggleCamera: () => void;
};

/** Renders the camera preview, permission state, and physical controls. */
export const PullDownCameraContent = ({
  cameraRef,
  cameraActive,
  controlsEnabled,
  contentOpacity,
  device,
  hasPermission,
  position,
  flashEnabled,
  canUseFlash,
  cameraError,
  isCapturing,
  shutterScale,
  shutterLoadingRotation,
  onCameraError,
  onRequestPermission,
  onToggleFlash,
  onTakePhoto,
  onToggleCamera,
}: Props) => (
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
            ref={cameraRef}
            device={device}
            isActive={cameraActive}
            onError={error => onCameraError(error.message)}
            photo
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={styles.permissionState}>
            <ShieldAlert color={colors.gold} size={28} strokeWidth={1.5} />
            <Text style={styles.permissionTitle}>
              {hasPermission ? 'Finding camera…' : 'Camera access needed'}
            </Text>
            {!hasPermission && (
              <Pressable
                onPress={onRequestPermission}
                style={styles.permissionButton}>
                <Text style={styles.permissionButtonText}>ALLOW CAMERA</Text>
              </Pressable>
            )}
          </View>
        )}

        <CameraFocusOverlay flashEnabled={flashEnabled} position={position} />
      </View>
    </View>

    <View style={styles.controls}>
      <Pressable
        accessibilityLabel={flashEnabled ? 'Turn flash off' : 'Turn flash on'}
        accessibilityRole="button"
        disabled={!canUseFlash}
        onPress={onToggleFlash}
        style={({pressed}) => [
          styles.sideControl,
          flashEnabled && styles.sideControlActive,
          !canUseFlash && styles.sideControlDisabled,
          pressed && styles.controlPressed,
        ]}>
        {flashEnabled ? (
          <Zap color={colors.background} fill={colors.background} size={18} />
        ) : (
          <ZapOff color={colors.goldSoft} size={18} strokeWidth={1.7} />
        )}
      </Pressable>

      <Pressable
        accessibilityLabel="Take photo"
        accessibilityRole="button"
        disabled={!hasPermission || !device || isCapturing}
        onPress={onTakePhoto}>
        <Animated.View
          style={[styles.shutterOuter, {transform: [{scale: shutterScale}]}]}>
          <View
            style={[
              styles.shutterInner,
              isCapturing && styles.shutterInnerLoading,
            ]}>
            {isCapturing ? (
              <Animated.View
                accessibilityLabel="Taking photo"
                accessibilityRole="progressbar"
                style={[
                  styles.shutterLoadingRing,
                  {
                    transform: [
                      {
                        rotate: shutterLoadingRotation.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ) : null}
          </View>
        </Animated.View>
      </Pressable>

      <Pressable
        accessibilityLabel="Switch front or back camera"
        accessibilityRole="button"
        onPress={onToggleCamera}
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
);

type FocusOverlayProps = {
  position: CameraPosition;
  flashEnabled: boolean;
};

/** Adds framing corners and the current lens/flash status over the preview. */
const CameraFocusOverlay = ({position, flashEnabled}: FocusOverlayProps) => (
  <>
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
  </>
);

const styles = StyleSheet.create({
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInnerLoading: {backgroundColor: '#111114'},
  shutterLoadingRing: {
    width: 31,
    height: 31,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: 'rgba(213,181,109,0.28)',
    borderTopColor: colors.cream,
    borderRightColor: colors.gold,
  },
  cameraHint: {
    height: 16,
    textAlign: 'center',
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.muted,
  },
});
