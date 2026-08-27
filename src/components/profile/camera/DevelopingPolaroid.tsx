import React from 'react';
import {ChevronDown, Smartphone, X} from 'lucide-react-native';
import {
  Animated,
  type GestureResponderHandlers,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors} from '../../../theme';
import type {PhotoPhase} from '../../../types/camera';

type Props = {
  photoUri: string;
  photoNumber: number;
  photoPhase: PhotoPhase;
  blurRadius: number;
  photoProgress: Animated.Value;
  developProgress: Animated.Value;
  cardShake: Animated.Value;
  arrowBounce: Animated.Value;
  photoPull: Animated.Value;
  panHandlers: GestureResponderHandlers;
  onDiscard: () => void;
};

/** Renders the print, blur, shake hint, discard, and pull-to-save card UI. */
export const DevelopingPolaroid = ({
  photoUri,
  photoNumber,
  photoPhase,
  blurRadius,
  photoProgress,
  developProgress,
  cardShake,
  arrowBounce,
  photoPull,
  panHandlers,
  onDiscard,
}: Props) => {
  const isShakeStage =
    photoPhase === 'waitingForShake' || photoPhase === 'revealing';
  const isSaveStage = photoPhase === 'readyToSave' || photoPhase === 'saving';

  return (
    <View pointerEvents="box-none" style={styles.viewport}>
      <Animated.View
        {...panHandlers}
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
          onPress={onDiscard}
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
          {isShakeStage && (
            <View
              pointerEvents="none"
              style={[
                styles.shakeHint,
                photoPhase === 'revealing' && styles.shakeHintFading,
              ]}>
              <Smartphone color={colors.goldSoft} size={22} strokeWidth={1.6} />
              <Text style={styles.shakeHintTitle}>
                {photoPhase === 'revealing' ? 'DEVELOPING…' : 'SHAKE IT'}
              </Text>
              <Text style={styles.shakeHintText}>
                Give your phone a gentle shake
              </Text>
            </View>
          )}
        </View>

        <View style={styles.captionRow}>
          <View>
            <Text style={styles.caption}>A quiet coffee moment</Text>
            <Text style={styles.captionMeta}>
              NOIR CAMERA · MEMORY {String(photoNumber).padStart(2, '0')}
            </Text>
          </View>
          <View style={styles.goldStamp}>
            <Text style={styles.goldStampText}>FW</Text>
          </View>
        </View>

        {isSaveStage && (
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
            <ChevronDown color={colors.gold} size={32} strokeWidth={2.8} />
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  viewport: {
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
});
