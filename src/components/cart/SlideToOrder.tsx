import React, {useState} from 'react';
import {ArrowRight, Check, ChevronsRight} from 'lucide-react-native';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSlideToOrderAnimation} from '../../animations/cart/useSlideToOrderAnimation';
import {colors} from '../../theme';

const TRACK_INSET = 4;
const THUMB_SIZE = 50;

type Props = {onComplete: () => void};

/** Confirms an action only after the thumb crosses the slide threshold. */
export const SlideToOrder = ({onComplete}: Props) => {
  const [width, setWidth] = useState(0);
  const maxTravel = Math.max(0, width - THUMB_SIZE - TRACK_INSET * 2);
  const animation = useSlideToOrderAnimation({maxTravel, onComplete});

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <Animated.View
      {...animation.panHandlers}
      accessibilityActions={[{name: 'activate', label: 'Place order'}]}
      accessibilityLabel="Slide to place order"
      accessibilityRole="button"
      onAccessibilityAction={event => {
        if (event.nativeEvent.actionName === 'activate') {
          animation.finish();
        }
      }}
      onLayout={handleLayout}
      style={styles.track}>
      <View pointerEvents="none" style={styles.labelWrap}>
        <Text style={styles.label}>
          {animation.completed ? 'Order confirmed' : 'Slide to place order'}
        </Text>
      </View>
      {!animation.completed ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.hint,
            {
              opacity: animation.arrowProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.35, 0.95],
              }),
              transform: [
                {
                  translateX: animation.arrowProgress.interpolate({
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
        style={[
          styles.thumbPosition,
          {transform: [{translateX: animation.translateX}]},
        ]}>
        <Animated.View
          style={[styles.thumb, {transform: [{scale: animation.thumbScale}]}]}>
          {animation.completed ? (
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
