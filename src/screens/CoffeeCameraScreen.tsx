import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  Smartphone,
  X,
} from 'lucide-react-native';
import {
  Animated,
  Easing,
  PanResponder,
  PermissionsAndroid,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import RNShake from 'react-native-shake';
import {
  PullDownCoffeeCamera,
  type PullDownCoffeeCameraHandle,
} from '../components/profile/PullDownCoffeeCamera';
import {colors, spacing} from '../theme';

type Props = {onBack: () => void};
type PhotoPhase =
  | 'idle'
  | 'printing'
  | 'waitingForShake'
  | 'revealing'
  | 'readyToSave'
  | 'saving';

export const CoffeeCameraScreen = ({onBack}: Props) => {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoNumber, setPhotoNumber] = useState(0);
  const [photoPhase, setPhotoPhase] = useState<PhotoPhase>('idle');
  const [blurRadius, setBlurRadius] = useState(22);
  const [savedMessageVisible, setSavedMessageVisible] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const photoProgress = useRef(new Animated.Value(0)).current;
  const developProgress = useRef(new Animated.Value(0)).current;
  const clarityProgress = useRef(new Animated.Value(0)).current;
  const cardShake = useRef(new Animated.Value(0)).current;
  const arrowBounce = useRef(new Animated.Value(0)).current;
  const photoPull = useRef(new Animated.Value(0)).current;
  const revealStarted = useRef(false);
  const cameraController = useRef<PullDownCoffeeCameraHandle>(null);

  useEffect(() => {
    const listener = clarityProgress.addListener(({value}) => {
      const nextBlur = Math.round((1 - value) * 22);
      setBlurRadius(current => (current === nextBlur ? current : nextBlur));
    });
    return () => clarityProgress.removeListener(listener);
  }, [clarityProgress]);

  const revealPhoto = useCallback(() => {
    if (revealStarted.current) {
      return;
    }
    revealStarted.current = true;
    setPhotoPhase('revealing');

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

  const hasSavePermission = useCallback(async () => {
    if (Platform.OS !== 'android' || Number(Platform.Version) >= 29) {
      return true;
    }
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
    const existing = await PermissionsAndroid.check(permission);
    if (existing) {
      return true;
    }
    const result = await PermissionsAndroid.request(permission);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  const savePhoto = useCallback(async () => {
    if (!photoUri || photoPhase !== 'readyToSave') {
      return;
    }
    setPhotoPhase('saving');
    setSaveError(null);
    try {
      if (!(await hasSavePermission())) {
        throw new Error('permission');
      }
      await CameraRoll.save(photoUri, {
        type: 'photo',
        album: 'Noir Coffee',
      });
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
        setSavedMessageVisible(true);
        setTimeout(() => setSavedMessageVisible(false), 2400);
      });
    } catch {
      setPhotoPhase('readyToSave');
      setSaveError('Could not save. Please allow photo access and try again.');
      Animated.spring(photoPull, {
        toValue: 0,
        damping: 18,
        stiffness: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [hasSavePermission, photoPhase, photoPull, photoUri]);

  const discardPhoto = useCallback(() => {
    if (photoPhase === 'saving') {
      return;
    }
    photoProgress.stopAnimation();
    developProgress.stopAnimation();
    clarityProgress.stopAnimation();
    cardShake.stopAnimation();
    arrowBounce.stopAnimation();
    photoPull.stopAnimation();
    revealStarted.current = false;
    setPhotoUri(null);
    setPhotoPhase('idle');
    setBlurRadius(22);
    setSaveError(null);
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
    photoPhase,
    photoProgress,
    photoPull,
  ]);

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
          Animated.spring(photoPull, {
            toValue: 0,
            damping: 17,
            stiffness: 210,
            useNativeDriver: true,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(photoPull, {
            toValue: 0,
            damping: 17,
            stiffness: 210,
            useNativeDriver: true,
          }).start();
        },
      }),
    [photoPhase, photoPull, savePhoto],
  );

  const pagePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          !photoUri &&
          Math.abs(gesture.dy) > 5 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => cameraController.current?.beginPull(),
        onPanResponderMove: (_, gesture) =>
          cameraController.current?.movePull(gesture.dy),
        onPanResponderRelease: (_, gesture) =>
          cameraController.current?.endPull(gesture.vy),
        onPanResponderTerminate: () => cameraController.current?.cancelPull(),
      }),
    [photoUri],
  );

  const handleCapture = useCallback(
    (capturedUri: string) => {
      setPhotoNumber(current => current + 1);
      setPhotoUri(capturedUri);
      setPhotoPhase('printing');
      setBlurRadius(22);
      setSaveError(null);
      revealStarted.current = false;
      photoProgress.setValue(0);
      developProgress.setValue(0);
      clarityProgress.setValue(0);
      photoPull.setValue(0);

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
    [clarityProgress, developProgress, photoProgress, photoPull],
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
            <View pointerEvents="box-none" style={styles.printViewport}>
              <Animated.View
                {...photoPanResponder.panHandlers}
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
                      {
                        translateX: cardShake.interpolate({
                          inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
                          outputRange: [0, -10, 11, -8, 6, 0],
                        }),
                      },
                      {translateY: photoPull},
                    ],
                  },
                ]}>
                <Pressable
                  accessibilityLabel="Discard photo and retake"
                  accessibilityRole="button"
                  disabled={photoPhase === 'saving'}
                  hitSlop={12}
                  onPress={discardPhoto}
                  style={({pressed}) => [
                    styles.discardButton,
                    pressed && styles.discardButtonPressed,
                    photoPhase === 'saving' && styles.discardButtonDisabled,
                  ]}>
                  <X color={colors.goldSoft} size={18} strokeWidth={2.2} />
                </Pressable>
                <View style={styles.photoFrame}>
                  <Animated.Image
                    accessibilityLabel="Captured coffee memory"
                    resizeMode="cover"
                    source={{uri: photoUri}}
                    blurRadius={blurRadius}
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
                  {(photoPhase === 'waitingForShake' ||
                    photoPhase === 'revealing') && (
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.shakeHint,
                        photoPhase === 'revealing' && styles.shakeHintFading,
                      ]}>
                      <Smartphone
                        color={colors.goldSoft}
                        size={22}
                        strokeWidth={1.6}
                      />
                      <Text style={styles.shakeHintTitle}>
                        {photoPhase === 'revealing'
                          ? 'DEVELOPING…'
                          : 'SHAKE IT'}
                      </Text>
                      <Text style={styles.shakeHintText}>
                        Give your phone a gentle shake
                      </Text>
                    </Animated.View>
                  )}
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
                {(photoPhase === 'readyToSave' || photoPhase === 'saving') && (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.saveHint,
                      photoPhase === 'saving' && styles.saveHintSaving,
                      {
                        transform: [
                          {
                            translateY: arrowBounce.interpolate({
                              inputRange: [0, 1],
                              outputRange: [0, 9],
                            }),
                          },
                        ],
                      },
                    ]}>
                    <Text style={styles.saveHintText}>
                      {photoPhase === 'saving'
                        ? 'SAVING TO ALBUM'
                        : 'PULL DOWN TO SAVE'}
                    </Text>
                    <ChevronDown
                      color={colors.gold}
                      size={32}
                      strokeWidth={2.8}
                    />
                  </Animated.View>
                )}
              </Animated.View>
            </View>
          )}
        </View>
        {saveError && (
          <View style={styles.errorToast}>
            <Text style={styles.errorToastText}>{saveError}</Text>
          </View>
        )}
        {savedMessageVisible && (
          <View style={styles.savedToast}>
            <Check color={colors.background} size={17} strokeWidth={2.6} />
            <Text style={styles.savedToastText}>
              Saved to Noir Coffee album
            </Text>
          </View>
        )}
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
  discardButton: {
    position: 'absolute',
    top: -17,
    right: -17,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: '#111114',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    elevation: 20,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 4},
  },
  discardButtonPressed: {transform: [{scale: 0.88}], opacity: 0.72},
  discardButtonDisabled: {opacity: 0.35},
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
  shakeHint: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: '35%',
    minHeight: 86,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(211, 176, 104, 0.55)',
    backgroundColor: 'rgba(8, 8, 10, 0.78)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shakeHintFading: {opacity: 0.52},
  shakeHintTitle: {
    marginTop: 7,
    color: colors.goldSoft,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  shakeHintText: {marginTop: 4, color: colors.muted, fontSize: 7},
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
  saveHint: {
    position: 'absolute',
    bottom: -123,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  saveHintText: {
    marginBottom: 3,
    color: colors.gold,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  saveHintSaving: {opacity: 0.45},
  savedToast: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 23,
    backgroundColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 7},
    elevation: 12,
  },
  savedToastText: {
    marginLeft: 8,
    color: colors.background,
    fontSize: 10,
    fontWeight: '900',
  },
  errorToast: {
    position: 'absolute',
    bottom: 34,
    left: spacing.screen,
    right: spacing.screen,
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 23,
    backgroundColor: '#9B3333',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
  },
  errorToastText: {
    color: '#FFF7F1',
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '800',
  },
});
