import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {colors} from '../../theme';

type Props = {
  categories: string[];
  onChange: (category: string) => void;
  value: string;
};

type TabProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

const CategoryTab = ({active, label, onPress}: TabProps) => {
  const activeProgress = useRef(new Animated.Value(active ? 1 : 0)).current;
  const pressScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(activeProgress, {
      toValue: active ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [active, activeProgress]);

  const animatePress = (toValue: number) => {
    Animated.spring(pressScale, {
      toValue,
      damping: 18,
      stiffness: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[styles.tab, {transform: [{scale: pressScale}]}]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{selected: active}}
        onPress={onPress}
        onPressIn={() => animatePress(0.95)}
        onPressOut={() => animatePress(1)}
        style={styles.pressable}>
        <Animated.Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: activeProgress.interpolate({
                inputRange: [0, 1],
                outputRange: [colors.muted, colors.background],
              }),
            },
          ]}>
          {label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
};

/** Displays animated category tabs with a shared sliding selection indicator. */
export const CoffeeCategorySelector = ({
  categories,
  onChange,
  value,
}: Props) => {
  const [width, setWidth] = useState(0);
  const indicatorX = useRef(new Animated.Value(0)).current;
  const initialized = useRef(false);
  const selectedIndex = Math.max(0, categories.indexOf(value));
  const itemWidth = width > 0 ? (width - 6) / categories.length : 0;

  useEffect(() => {
    if (!itemWidth) {
      return;
    }

    const destination = selectedIndex * itemWidth;
    if (!initialized.current) {
      indicatorX.setValue(destination);
      initialized.current = true;
      return;
    }

    Animated.spring(indicatorX, {
      toValue: destination,
      damping: 20,
      stiffness: 220,
      mass: 0.8,
      useNativeDriver: true,
    }).start();
  }, [indicatorX, itemWidth, selectedIndex]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  return (
    <View onLayout={handleLayout} style={styles.container}>
      {itemWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {width: itemWidth, transform: [{translateX: indicatorX}]},
          ]}
        />
      ) : null}
      {categories.map(category => (
        <CategoryTab
          active={value === category}
          key={category}
          label={category}
          onPress={() => onChange(category)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    padding: 3,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    left: 3,
    top: 3,
    bottom: 3,
    borderRadius: 19,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  tab: {flex: 1, height: 38},
  pressable: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  label: {fontSize: 9, fontWeight: '900'},
});
