import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {colors} from '../../../theme';

type Props = {photoProgress: Animated.Value};

/** Shows the temporary printer opening while the photo card is emerging. */
export const PolaroidPrinterSlot = ({photoProgress}: Props) => (
  <Animated.View
    pointerEvents="none"
    style={[
      styles.container,
      {
        opacity: photoProgress.interpolate({
          inputRange: [0, 0.05, 0.82, 1],
          outputRange: [0, 1, 1, 0],
        }),
      },
    ]}>
    <View style={styles.mouth} />
    <View style={styles.highlight} />
  </Animated.View>
);

const styles = StyleSheet.create({
  container: {
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
  mouth: {flex: 1, borderRadius: 5, backgroundColor: '#000000'},
  highlight: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 2,
    height: 1,
    backgroundColor: colors.goldSoft,
    opacity: 0.45,
  },
});
