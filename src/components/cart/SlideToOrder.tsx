import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ArrowRight, Check, ChevronsRight} from 'lucide-react-native';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors} from '../../theme';

const TRACK_INSET = 4;
const THUMB_SIZE = 50;

type Props = {onComplete: () => void};

/** Confirms an action only after the thumb crosses the slide threshold. */
export const SlideToOrder = ({onComplete}: Props) => {
  const [width, setWidth] = useState(0);
  const [completed, setCompleted] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;
  const thumbScale = useRef(new Animated.Value(1)).current;
  const arrowProgress = useRef(new Animated.Value(0)).current;
  const completingRef = useRef(false);
  const completionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTravel = Math.max(0, width - THUMB_SIZE - TRACK_INSET * 2);

  useEffect(() => {
    const arrowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowProgress, {
          toValue: 1,
          duration: 760,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(arrowProgress, {
          toValue: 0,
          duration: 760,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    arrowLoop.start();

    return () => {
      arrowLoop.stop();
      if (completionTimer.current) {
        clearTimeout(completionTimer.current);
      }
    };
  }, [arrowProgress]);

  const animateThumbScale = useCallback(
    (toValue: number) => {
      Animated.spring(thumbScale, {
        toValue,
        damping: 18,
        stiffness: 280,
        useNativeDriver: true,
      }).start();
    },
    [thumbScale],
  );

  const reset = useCallback(() => {
    Animated.spring(translateX, {
      toValue: 0,
      damping: 18,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: false,
    }).start();
  }, [translateX]);

  const finish = useCallback(() => {
    if (completingRef.current || !maxTravel) {
      return;
    }

    completingRef.current = true;
    setCompleted(true);
    Animated.timing(translateX, {
      toValue: maxTravel,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished) {
        completionTimer.current = setTimeout(onComplete, 220);
      }
    });
  }, [maxTravel, onComplete, translateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !completingRef.current &&
          Math.abs(gesture.dx) > 5 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderGrant: () => animateThumbScale(1.06),
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(Math.max(0, Math.min(maxTravel, gesture.dx)));
        },
        onPanResponderRelease: (_, gesture) => {
          animateThumbScale(1);
          if (
            gesture.dx >= maxTravel * 0.78 ||
            (gesture.vx > 0.9 && gesture.dx > maxTravel * 0.58)
          ) {
            finish();
          } else {
            reset();
          }
        },
        onPanResponderTerminate: () => {
          animateThumbScale(1);
          reset();
        },
      }),
    [animateThumbScale, finish, maxTravel, reset, translateX],
  );

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      accessibilityActions={[{name: 'activate', label: 'Place order'}]}
      accessibilityLabel="Slide to place order"
      accessibilityRole="button"
      onAccessibilityAction={event => {
        if (event.nativeEvent.actionName === 'activate') {
          finish();
        }
      }}
      onLayout={handleLayout}
      style={styles.track}>
      <View pointerEvents="none" style={styles.labelWrap}>
        <Text style={styles.label}>
          {completed ? 'Order confirmed' : 'Slide to place order'}
        </Text>
      </View>
      {!completed ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.hint,
            {
              opacity: arrowProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.35, 0.95],
              }),
              transform: [
                {
                  translateX: arrowProgress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-3, 3],
                  }),
                },
              ],
            },
          ]}>
          <ChevronsRight
            color={colors.background}
            size={22}
            strokeWidth={1.8}
          />
        </Animated.View>
      ) : null}
      <Animated.View
        pointerEvents="none"
        style={[styles.thumbPosition, {transform: [{translateX}]}]}>
        <Animated.View
          style={[styles.thumb, {transform: [{scale: thumbScale}]}]}>
          {completed ? (
            <Check color={colors.goldSoft} size={21} strokeWidth={2.5} />
          ) : (
            <ArrowRight color={colors.goldSoft} size={20} strokeWidth={2.2} />
          )}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 58,
    borderRadius: 21,
    backgroundColor: colors.gold,
    marginTop: 7,
    padding: TRACK_INSET,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  labelWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {fontSize: 12, fontWeight: '900', color: colors.background},
  hint: {position: 'absolute', right: 15, alignItems: 'center'},
  thumbPosition: {width: THUMB_SIZE, height: THUMB_SIZE},
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 18,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.28,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
  },
});
