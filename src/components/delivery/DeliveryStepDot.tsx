import React from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {useDeliveryStepRadarAnimation} from '../../animations/delivery/useDeliveryStepRadarAnimation';
import {colors} from '../../theme';

type Props = {active: boolean; complete: boolean};

/** Shows a quiet checkpoint or a radar pulse for the current delivery step. */
export const DeliveryStepDot = ({active, complete}: Props) => {
  const radar = useDeliveryStepRadarAnimation(active);

  return (
    <View style={styles.slot}>
      {active ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.radarRing,
            {
              opacity: radar.radarOpacity,
              transform: [{scale: radar.radarScale}],
            },
          ]}
        />
      ) : null}
      <Animated.View
        style={[
          styles.dot,
          complete && styles.completeDot,
          active && styles.activeDot,
          active
            ? {
                opacity: radar.dotOpacity,
                transform: [{scale: radar.dotScale}],
              }
            : undefined,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    width: 10,
    height: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  radarRing: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.goldSoft,
    backgroundColor: 'rgba(213, 181, 109, 0.12)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  completeDot: {backgroundColor: colors.gold, borderColor: colors.gold},
  activeDot: {
    borderColor: colors.cream,
    shadowColor: colors.goldSoft,
    shadowOpacity: 0.95,
    shadowRadius: 7,
    shadowOffset: {width: 0, height: 0},
    elevation: 8,
  },
});
