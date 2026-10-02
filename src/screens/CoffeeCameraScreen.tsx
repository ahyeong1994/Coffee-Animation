import React, {useCallback, useMemo, useRef, useState} from 'react';
import {ArrowLeft} from 'lucide-react-native';
import {
  PanResponder,
  Pressable,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  View,
} from 'react-native';
import {CoffeeCameraEmptyState} from '../components/profile/camera/CoffeeCameraEmptyState';
import {DevelopingPolaroid} from '../components/profile/camera/DevelopingPolaroid';
import {PhotoFlowFeedback} from '../components/profile/camera/PhotoFlowFeedback';
import {
  PullDownCoffeeCamera,
  type PullDownCoffeeCameraHandle,
} from '../components/profile/PullDownCoffeeCamera';
import {POLAROID_PRINT_LAYOUT, useCoffeePhotoFlow} from '../animations/camera';
import {coffeeCameraScreenStyles as styles} from '../styles/screens';
import {colors, spacing} from '../theme';

type Props = {onBack: () => void};

/** Composes the pull-down camera with the post-capture development flow. */
export const CoffeeCameraScreen = ({onBack}: Props) => {
  const {width: screenWidth} = useWindowDimensions();
  const cameraController = useRef<PullDownCoffeeCameraHandle>(null);
  const [printerOriginY, setPrinterOriginY] = useState(24);
  const photoFlow = useCoffeePhotoFlow();
  const polaroidWidth = Math.min(
    (screenWidth - spacing.screen * 2) * POLAROID_PRINT_LAYOUT.widthRatio,
    POLAROID_PRINT_LAYOUT.maxWidth,
  );
  const handlePrinterOriginChange = useCallback((originY: number) => {
    setPrinterOriginY(current =>
      Math.abs(current - originY) < 0.5 ? current : originY,
    );
  }, []);

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
          onPrinterOriginChange={handlePrinterOriginChange}
          printing={photoFlow.photoPhase === 'printing'}
          printerWidth={polaroidWidth}
        />

        <View style={styles.content}>
          {!photoFlow.photoUri ? <CoffeeCameraEmptyState /> : null}
        </View>

        {photoFlow.photoUri ? (
          <DevelopingPolaroid
            arrowBounce={photoFlow.arrowBounce}
            blurRadius={photoFlow.blurRadius}
            cardWidth={polaroidWidth}
            cardShake={photoFlow.cardShake}
            developProgress={photoFlow.developProgress}
            onDiscard={photoFlow.discardPhoto}
            panHandlers={photoFlow.photoPanHandlers}
            photoNumber={photoFlow.photoNumber}
            photoPhase={photoFlow.photoPhase}
            photoProgress={photoFlow.photoProgress}
            photoPull={photoFlow.photoPull}
            photoUri={photoFlow.photoUri}
            printOriginY={printerOriginY}
            shakeProgress={photoFlow.shakeProgress}
          />
        ) : null}

        <PhotoFlowFeedback
          error={photoFlow.saveError}
          savedMessageVisible={photoFlow.savedMessageVisible}
        />
      </SafeAreaView>
    </View>
  );
};
