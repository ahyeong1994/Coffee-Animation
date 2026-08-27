import React, {useMemo, useRef} from 'react';
import {ArrowLeft} from 'lucide-react-native';
import {
  PanResponder,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {CoffeeCameraEmptyState} from '../components/profile/camera/CoffeeCameraEmptyState';
import {DevelopingPolaroid} from '../components/profile/camera/DevelopingPolaroid';
import {PhotoFlowFeedback} from '../components/profile/camera/PhotoFlowFeedback';
import {PolaroidPrinterSlot} from '../components/profile/camera/PolaroidPrinterSlot';
import {
  PullDownCoffeeCamera,
  type PullDownCoffeeCameraHandle,
} from '../components/profile/PullDownCoffeeCamera';
import {useCoffeePhotoFlow} from '../animations/camera';
import {colors, spacing} from '../theme';

type Props = {onBack: () => void};

/** Composes the pull-down camera with the post-capture development flow. */
export const CoffeeCameraScreen = ({onBack}: Props) => {
  const cameraController = useRef<PullDownCoffeeCameraHandle>(null);
  const photoFlow = useCoffeePhotoFlow();

  const pagePanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          !photoFlow.photoUri &&
          Math.abs(gesture.dy) > 5 &&
          Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderGrant: () => cameraController.current?.beginPull(),
        onPanResponderMove: (_, gesture) =>
          cameraController.current?.movePull(gesture.dy),
        onPanResponderRelease: (_, gesture) =>
          cameraController.current?.endPull(gesture.vy),
        onPanResponderTerminate: () => cameraController.current?.cancelPull(),
      }),
    [photoFlow.photoUri],
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
          onCapture={photoFlow.handleCapture}
        />

        {photoFlow.photoUri && (
          <PolaroidPrinterSlot photoProgress={photoFlow.photoProgress} />
        )}

        <View style={styles.content}>
          {!photoFlow.photoUri ? (
            <CoffeeCameraEmptyState />
          ) : (
            <DevelopingPolaroid
              arrowBounce={photoFlow.arrowBounce}
              blurRadius={photoFlow.blurRadius}
              cardShake={photoFlow.cardShake}
              developProgress={photoFlow.developProgress}
              onDiscard={photoFlow.discardPhoto}
              panHandlers={photoFlow.photoPanHandlers}
              photoNumber={photoFlow.photoNumber}
              photoPhase={photoFlow.photoPhase}
              photoProgress={photoFlow.photoProgress}
              photoPull={photoFlow.photoPull}
              photoUri={photoFlow.photoUri}
            />
          )}
        </View>

        <PhotoFlowFeedback
          error={photoFlow.saveError}
          savedMessageVisible={photoFlow.savedMessageVisible}
        />
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
});
