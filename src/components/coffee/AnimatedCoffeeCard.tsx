import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import {Point} from '../../hooks/useCartFlightAnimation';
import {Coffee} from '../../types/app';
import {CoffeeCard} from './CoffeeCard';

type Props = {
  coffee: Coffee;
  index: number;
  onAdd: (origin: Point) => void;
};

export const AnimatedCoffeeCard = ({coffee, index, onAdd}: Props) => {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      delay: Math.min(index, 4) * 55,
      duration: 340,
      useNativeDriver: true,
    }).start();
  }, [index, progress]);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: [
          {
            translateY: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          },
        ],
      }}>
      <CoffeeCard coffee={coffee} onAdd={onAdd} />
    </Animated.View>
  );
};
