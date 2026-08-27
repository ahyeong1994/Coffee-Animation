import React, {useCallback, useMemo, useRef, useState} from 'react';
import {ArrowLeft, Camera} from 'lucide-react-native';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  PullDownCoffeeCamera,
  type PullDownCoffeeCameraHandle,
} from '../components/profile/PullDownCoffeeCamera';
import {colors, spacing} from '../theme';

type Props = {onBack: () => void};

export const CoffeeCameraScreen = ({onBack}: Props) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoNumber, setPhotoNumber] = useState(0);
  const photoProgress = useRef(new Animated.Value(0)).current;
  const developProgress = useRef(new Animated.Value(0)).current;
  const cameraController = useRef<PullDownCoffeeCameraHandle>(null);

  const pagePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          Math.abs(gesture.dy) > 5 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => cameraController.current?.beginPull(),
        onPanResponderMove: (_, gesture) =>
          cameraController.current?.movePull(gesture.dy),
        onPanResponderRelease: (_, gesture) =>
          cameraController.current?.endPull(gesture.vy),
        onPanResponderTerminate: () => cameraController.current?.cancelPull(),
      }),
    [],
  );

  const handleCapture = useCallback(
    (capturedUri: string) => {
      setPhotoNumber(current => current + 1);
      setPhotoUri(capturedUri);
      photoProgress.setValue(0);
      developProgress.setValue(0);

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
      ]).start();

      Animated.sequence([
        Animated.delay(760),
        Animated.timing(developProgress, {
          toValue: 1,
          duration: 1450,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    },
    [developProgress, photoProgress],
  );

  return (
    <View {...pagePanResponder.panHandlers} style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <View pointerEvents="box-none" style={styles.header}>
          <Pressable
            accessibilityLabel="Back to profile"
            accessibilityRole="button"
            hitSlop={10}
            onPress={onBack}
            style={({pressed}) => [
              styles.backButton,
              pressed && styles.backButtonPressed,
            ]}>
            <ArrowLeft color={colors.goldSoft} size={20} strokeWidth={2} />
          </Pressable>
        </View>

        <PullDownCoffeeCamera
          ref={cameraController}
          onCapture={handleCapture}
        />

        {photoUri && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.printerSlot,
              {
                opacity: photoProgress.interpolate({
                  inputRange: [0, 0.05, 0.82, 1],
                  outputRange: [0, 1, 1, 0],
                }),
              },
            ]}>
            <View style={styles.printerSlotMouth} />
            <View style={styles.printerSlotHighlight} />
          </Animated.View>
        )}

        <View style={styles.content}>
          {!photoUri ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Camera color={colors.gold} size={27} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>Pull down the camera</Text>
              <Text style={styles.emptyMessage}>
                Pull down anywhere on this screen, frame your coffee, then press
                the shutter to print a memory.
              </Text>
              <View style={styles.pullHint}>
                <View style={styles.pullHintLine} />
                <Text style={styles.pullHintText}>PULL DOWN ANYWHERE</Text>
                <View style={styles.pullHintLine} />
              </View>
            </View>
          ) : (
            <View pointerEvents="none" style={styles.printViewport}>
              <Animated.View
                style={[
                  styles.polaroid,
                  {
                    opacity: photoProgress.interpolate({
                      inputRange: [0, 0.08, 1],
                      outputRange: [0, 1, 1],
                    }),
                    transform: [
                      {
                        translateY: photoProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-455, 50],
                        }),
                      },
                      {
                        scale: photoProgress.interpolate({
                          inputRange: [0, 0.82, 1],
                          outputRange: [0.58, 0.97, 1],
                        }),
                      },
                      {
                        rotate: photoProgress.interpolate({
                          inputRange: [0, 0.82, 1],
                          outputRange: ['-1deg', '0.5deg', '-0.8deg'],
                        }),
                      },
                    ],
                  },
                ]}>
                <View style={styles.photoFrame}>
                  <Animated.Image
                    accessibilityLabel="Captured coffee memory"
                    resizeMode="cover"
                    source={{uri: photoUri}}
                    style={[styles.photo, {opacity: developProgress}]}
                  />
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.developingPaper,
                      {
                        opacity: developProgress.interpolate({
                          inputRange: [0, 0.72, 1],
                          outputRange: [0.92, 0.34, 0],
                        }),
                      },
                    ]}
                  />
                </View>
                <View style={styles.captionRow}>
                  <View>
                    <Text style={styles.caption}>A quiet coffee moment</Text>
                    <Text style={styles.captionMeta}>
                      NOIR CAMERA · MEMORY{' '}
                      {String(photoNumber).padStart(2, '0')}
                    </Text>
                  </View>
                  <View style={styles.goldStamp}>
                    <Text style={styles.goldStampText}>FW</Text>
                  </View>
                </View>
              </Animated.View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  safeArea: {flex: 1},
  header: {
    height: 68,
    paddingHorizontal: spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonPressed: {transform: [{scale: 0.93}], opacity: 0.75},
  content: {
    flex: 1,
    paddingHorizontal: spacing.screen,
    paddingTop: 62,
    alignItems: 'center',
  },
  printerSlot: {
    position: 'absolute',
    top: 45,
    left: '50%',
    width: 214,
    height: 19,
    marginLeft: -107,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: '#08080A',
    paddingHorizontal: 16,
    paddingVertical: 5,
    zIndex: 9,
    shadowColor: '#000000',
    shadowOpacity: 0.75,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 5},
    elevation: 20,
  },
  printerSlotMouth: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  printerSlotHighlight: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 2,
    height: 1,
    backgroundColor: colors.goldSoft,
    opacity: 0.45,
  },
  emptyState: {alignItems: 'center', paddingTop: 70, maxWidth: 300},
  emptyIcon: {
    width: 62,
    height: 62,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  emptyMessage: {
    marginTop: 9,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 17,
    color: colors.muted,
  },
  pullHint: {
    marginTop: 26,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pullHintLine: {width: 34, height: 1, backgroundColor: colors.border},
  pullHintText: {
    marginHorizontal: 10,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.gold,
  },
  printViewport: {
    position: 'absolute',
    top: -4,
    bottom: -20,
    left: 0,
    right: 0,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 4,
  },
  polaroid: {
    width: '73%',
    maxWidth: 390,
    borderRadius: 8,
    backgroundColor: colors.cream,
    padding: 14,
    paddingBottom: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: {width: 0, height: 12},
    elevation: 14,
  },
  photoFrame: {
    width: '100%',
    aspectRatio: 1,
    overflow: 'hidden',
    backgroundColor: '#171719',
  },
  photo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#171719',
  },
  developingPaper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.cream,
  },
  captionRow: {
    marginTop: 15,
    paddingHorizontal: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  caption: {fontSize: 13, fontWeight: '900', color: colors.background},
  captionMeta: {
    marginTop: 4,
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: '#766B5E',
  },
  goldStamp: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldStampText: {fontSize: 8, fontWeight: '900', color: colors.background},
});
