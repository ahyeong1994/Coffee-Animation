import {useEffect, useRef} from 'react';
import {Animated, Easing} from 'react-native';

/** Creates a repeating radar wave and heartbeat for the active delivery step. */
export const useDeliveryStepRadarAnimation = (active: boolean) => {
  const radarProgress = useRef(new Animated.Value(0)).current;
  const heartbeat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    radarProgress.stopAnimation();
    heartbeat.stopAnimation();
    radarProgress.setValue(0);
    heartbeat.setValue(0);

    if (!active) {
      return;
    }

    const radarLoop = Animated.loop(
      Animated.timing(radarProgress, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    );
    const heartbeatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(heartbeat, {
          toValue: 1,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(heartbeat, {
          toValue: 0,
          duration: 520,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    radarLoop.start();
    heartbeatLoop.start();
    return () => {
      radarLoop.stop();
      heartbeatLoop.stop();
    };
  }, [active, heartbeat, radarProgress]);

  return {
    dotOpacity: heartbeat.interpolate({
      inputRange: [0, 1],
      outputRange: [0.72, 1],
    }),
    dotScale: heartbeat.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.32],
    }),
    radarOpacity: radarProgress.interpolate({
      inputRange: [0, 0.2, 1],
      outputRange: [0, 0.62, 0],
    }),
    radarScale: radarProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.72, 3],
    }),
  };
};
