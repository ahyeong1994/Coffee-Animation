import React, {useEffect, useRef, useState} from 'react';
import {Bike} from 'lucide-react-native';
import {Animated, Easing, StyleSheet, Text, View} from 'react-native';
import {colors} from '../../theme';
import {Delivery} from '../../types/app';

type Props = {status: Delivery['status']};

const steps = ['Confirmed', 'Brewing', 'Arriving'];

export const DeliveryProgress = ({status}: Props) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const travel = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const active = status !== 'Delivered';
  const completeSteps =
    status === 'Preparing' ? 1 : status === 'On the way' ? 2 : 3;

  useEffect(() => {
    travel.setValue(status === 'Delivered' ? 1 : 0);
    bounce.setValue(0);

    if (!active) {
      return;
    }

    const travelLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(travel, {
          toValue: 1,
          duration: status === 'Preparing' ? 2100 : 2600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.delay(300),
        Animated.timing(travel, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: 1,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 220,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    travelLoop.start();
    bounceLoop.start();
    return () => {
      travelLoop.stop();
      bounceLoop.stop();
    };
  }, [active, bounce, status, travel]);

  const firstStop = Math.max(0, trackWidth / 2 - 5);
  const finalStop = Math.max(0, trackWidth - 10);
  const start = status === 'Preparing' ? 0 : firstStop;
  const end = status === 'Preparing' ? firstStop : finalStop;
  const translateX = travel.interpolate({
    inputRange: [0, 1],
    outputRange: [start, end],
  });
  const translateY = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });
  const rotate = bounce.interpolate({
    inputRange: [0, 1],
    outputRange: ['-2deg', '2deg'],
  });
  const opacity = active
    ? travel.interpolate({
        inputRange: [0, 0.06, 0.9, 1],
        outputRange: [0.45, 1, 1, 0.2],
      })
    : 1;

  return (
    <View
      accessibilityLabel={`Delivery progress: ${status}`}
      onLayout={event => setTrackWidth(event.nativeEvent.layout.width)}
      style={styles.wrapper}>
      <View style={styles.vehicleLane}>
        {trackWidth > 0 ? (
          <Animated.View
            style={[
              styles.vehicle,
              !active && styles.deliveredVehicle,
              {
                opacity,
                transform: [{translateX}, {translateY}, {rotate}],
              },
            ]}>
            <Bike
              color={active ? colors.background : colors.goldSoft}
              size={18}
              strokeWidth={2.2}
            />
          </Animated.View>
        ) : null}
      </View>
      <View style={styles.timeline}>
        {steps.map((_, step) => (
          <React.Fragment key={step}>
            <View
              style={[styles.dot, step < completeSteps && styles.completeDot]}
            />
            {step < steps.length - 1 ? (
              <View
                style={[
                  styles.line,
                  step < completeSteps - 1 && styles.completeLine,
                ]}
              />
            ) : null}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.timelineLabels}>
        {steps.map((label, step) => (
          <Text
            key={label}
            style={[
              styles.timelineLabel,
              step < completeSteps && styles.completeLabel,
            ]}>
            {status === 'Delivered' && step === 2 ? 'Delivered' : label}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {marginTop: 20},
  vehicleLane: {height: 34},
  vehicle: {
    position: 'absolute',
    left: -10,
    bottom: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.gold,
    borderWidth: 1,
    borderColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 5,
  },
  deliveredVehicle: {backgroundColor: colors.elevated, shadowOpacity: 0},
  timeline: {flexDirection: 'row', alignItems: 'center'},
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
  },
  completeDot: {backgroundColor: colors.gold, borderColor: colors.gold},
  line: {height: 1, flex: 1, backgroundColor: colors.border},
  completeLine: {backgroundColor: colors.gold},
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timelineLabel: {fontSize: 8, color: colors.muted},
  completeLabel: {color: colors.goldSoft},
});
