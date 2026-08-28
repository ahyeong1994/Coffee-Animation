import React from 'react';
import {Animated, Modal, StyleSheet, Text, View} from 'react-native';
import {CartFlight} from '../../animations/cart/useCartFlightAnimation';
import {colors} from '../../theme';

type Props = {
  flight: CartFlight | null;
  progress: Animated.Value;
};

/** Renders the curved visual flight from a coffee card into the cart target. */
export const FlyingCoffee = ({flight, progress}: Props) => {
  if (!flight) {
    return null;
  }

  // X moves toward the cart while Y rises 105px at mid-flight. Together these
  // independent interpolations form a lightweight quadratic-looking arc.
  const translateX = progress.interpolate({
    inputRange: [0, 0.52, 1],
    outputRange: [
      0,
      (flight.target.x - flight.start.x) * 0.52,
      flight.target.x - flight.start.x,
    ],
  });
  const translateY = progress.interpolate({
    inputRange: [0, 0.52, 1],
    outputRange: [
      0,
      (flight.target.y - flight.start.y) * 0.52 - 105,
      flight.target.y - flight.start.y,
    ],
  });
  // Shrink aggressively near arrival so the coffee appears to enter the icon.
  const scale = progress.interpolate({
    inputRange: [0, 0.12, 0.78, 1],
    outputRange: [0.7, 1, 0.66, 0.18],
  });
  const opacity = progress.interpolate({
    inputRange: [0, 0.08, 0.84, 1],
    outputRange: [0, 1, 1, 0],
  });
  const rotate = progress.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: ['0deg', '-14deg', '22deg'],
  });

  return (
    <Modal animationType="none" hardwareAccelerated transparent visible>
      <View pointerEvents="none" style={styles.overlay}>
        <Animated.View
          style={[
            styles.flight,
            {
              left: flight.start.x - 28,
              top: flight.start.y - 28,
              opacity,
              transform: [{translateX}, {translateY}, {scale}, {rotate}],
            },
          ]}>
          <View
            style={[styles.coffee, {backgroundColor: flight.coffee.accent}]}>
            <Text style={styles.symbol}>{flight.coffee.symbol}</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {...StyleSheet.absoluteFillObject},
  flight: {position: 'absolute'},
  coffee: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
  },
  symbol: {fontSize: 25, color: colors.cream},
});
