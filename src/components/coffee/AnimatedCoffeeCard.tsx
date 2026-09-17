import React, {useEffect, useRef, useState} from 'react';
import {Animated, LayoutChangeEvent, StyleSheet} from 'react-native';
import {Point} from '../../animations/cart/useCartFlightAnimation';
import {colors} from '../../theme';
import {Coffee} from '../../types/app';
import {CoffeeCard} from './CoffeeCard';

type Props = {
  coffee: Coffee;
  index: number;
  onAdd: (origin: Point) => void;
  onPress: () => void;
  scrollY: Animated.Value;
  viewportHeight: number;
};

type CardLayout = {height: number; y: number};

/** Adds entry, parallax, focus, and perspective motion around a coffee card. */
export const AnimatedCoffeeCard = ({
  coffee,
  index,
  onAdd,
  onPress,
  scrollY,
  viewportHeight,
}: Props) => {
  const entryProgress = useRef(new Animated.Value(0)).current;
  const [layout, setLayout] = useState<CardLayout | null>(null);

  // Stagger only the first few cards; large lists should not wait progressively
  // longer for lower items. Copy this block for a simple list entrance effect.
  useEffect(() => {
    Animated.timing(entryProgress, {
      toValue: 1,
      delay: Math.min(index, 4) * 55,
      duration: 340,
      useNativeDriver: true,
    }).start();
  }, [entryProgress, index]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const {height, y} = event.nativeEvent.layout;
    setLayout({height, y});
  };

  // centerScroll is the scroll offset where this card sits at screen center.
  // Every interpolation below shares the same three-point focus range.
  const centerScroll =
    layout && viewportHeight
      ? layout.y + layout.height / 2 - viewportHeight / 2
      : 0;
  const focusDistance = Math.max(220, viewportHeight * 0.58);
  const focusRange = [
    centerScroll - focusDistance,
    centerScroll,
    centerScroll + focusDistance,
  ];
  const scale = scrollY.interpolate({
    inputRange: focusRange,
    outputRange: [0.94, 1.025, 0.94],
    extrapolate: 'clamp',
  });
  const opacity = scrollY.interpolate({
    inputRange: focusRange,
    outputRange: [0.58, 1, 0.58],
    extrapolate: 'clamp',
  });
  // perspective + rotateX creates the strong tilting/depth effect while scale
  // and opacity visually prioritize the card nearest the viewport center.
  const rotateX = scrollY.interpolate({
    inputRange: focusRange,
    outputRange: ['5deg', '0deg', '-5deg'],
    extrapolate: 'clamp',
  });
  const focusTranslateY = scrollY.interpolate({
    inputRange: focusRange,
    outputRange: [8, 0, -8],
    extrapolate: 'clamp',
  });
  const visualParallaxY = scrollY.interpolate({
    inputRange: focusRange,
    outputRange: [-18, 0, 18],
    extrapolate: 'clamp',
  });
  const highlightOpacity = scrollY.interpolate({
    inputRange: [
      centerScroll - focusDistance * 0.52,
      centerScroll,
      centerScroll + focusDistance * 0.52,
    ],
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      onLayout={handleLayout}
      style={{
        opacity: entryProgress,
        transform: [
          {
            translateY: entryProgress.interpolate({
              inputRange: [0, 1],
              outputRange: [10, 0],
            }),
          },
        ],
      }}>
      <Animated.View
        style={[
          styles.focusLayer,
          layout && viewportHeight
            ? {
                opacity,
                transform: [
                  {perspective: 850},
                  {translateY: focusTranslateY},
                  {scale},
                  {rotateX},
                ],
              }
            : undefined,
        ]}>
        <CoffeeCard
          coffee={coffee}
          onAdd={onAdd}
          onPress={onPress}
          visualParallaxY={
            layout && viewportHeight ? visualParallaxY : undefined
          }
        />
        {layout && viewportHeight ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.highlight, {opacity: highlightOpacity}]}
          />
        ) : null}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  focusLayer: {position: 'relative'},
  highlight: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 14,
    left: 0,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.goldSoft,
  },
});
