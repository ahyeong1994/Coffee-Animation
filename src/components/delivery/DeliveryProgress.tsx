import React, {useState} from 'react';
import {Bike} from 'lucide-react-native';
import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../theme';
import {Delivery} from '../../types/app';
import {useDeliveryVehicleAnimation} from '../../animations/delivery/useDeliveryVehicleAnimation';
import {DeliveryStepDot} from './DeliveryStepDot';

type Props = {
  status: Delivery['status'];
  onChangeStatus: (status: Delivery['status']) => void;
};

const steps = ['Brewing', 'Arriving', 'Delivered'];

/** Renders delivery checkpoints and binds them to the vehicle animation hook. */
export const DeliveryProgress = ({status, onChangeStatus}: Props) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const vehicle = useDeliveryVehicleAnimation(status, trackWidth);
  const completeSteps =
    status === 'Brewing' ? 1 : status === 'Arriving' ? 2 : 3;
  const activeStep = status === 'Brewing' ? 0 : status === 'Arriving' ? 1 : -1;
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
              !vehicle.active && styles.deliveredVehicle,
              {
                transform: [
                  {translateX: vehicle.translateX},
                  {translateY: vehicle.translateY},
                  {rotate: vehicle.rotate},
                ],
              },
            ]}>
            <Bike
              color={vehicle.active ? colors.background : colors.goldSoft}
              size={18}
              strokeWidth={2.2}
            />
          </Animated.View>
        ) : null}
      </View>
      <View style={styles.timeline}>
        {steps.map((_, step) => (
          <React.Fragment key={step}>
            <DeliveryStepDot
              active={step === activeStep}
              complete={step < completeSteps}
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
        <TouchableOpacity
          accessibilityLabel="Set delivery status to Brewing"
          accessibilityRole="button"
          accessibilityState={{selected: status === 'Brewing'}}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          onPress={() => onChangeStatus('Brewing')}>
          <Text
            style={[
              styles.timelineLabel,
              status === 'Brewing' && styles.selectedLabel,
            ]}>
            Brewing
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Set delivery status to Arriving"
          accessibilityRole="button"
          accessibilityState={{selected: status === 'Arriving'}}
          disabled={!vehicle.active}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          onPress={() => onChangeStatus('Arriving')}>
          <Text
            style={[
              styles.timelineLabel,
              status === 'Arriving' && styles.selectedLabel,
            ]}>
            Arriving
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="Mark delivery as Delivered"
          accessibilityRole="button"
          accessibilityState={{selected: status === 'Delivered'}}
          disabled={status === 'Delivered'}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          onPress={() => onChangeStatus('Delivered')}>
          <Text
            style={[
              styles.timelineLabel,
              status === 'Delivered' && styles.completeLabel,
            ]}>
            Delivered
          </Text>
        </TouchableOpacity>
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
  line: {height: 1, flex: 1, backgroundColor: colors.border},
  completeLine: {backgroundColor: colors.gold},
  timelineLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timelineLabel: {fontSize: 8, color: colors.muted},
  completeLabel: {color: colors.goldSoft},
  selectedLabel: {color: colors.goldSoft, fontWeight: '900'},
});
