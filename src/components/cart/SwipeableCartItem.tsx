import React, {ReactNode, useCallback, useMemo, useRef, useState} from 'react';
import {Trash2} from 'lucide-react-native';
import {
  Animated,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../theme';

const ACTION_WIDTH = 94;

type Props = {
  accessibilityName: string;
  children: ReactNode;
  onRemove: () => void;
};

export const SwipeableCartItem = ({
  accessibilityName,
  children,
  onRemove,
}: Props) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const openRef = useRef(false);
  const gestureStart = useRef(0);
  const [isOpen, setIsOpen] = useState(false);

  const settle = useCallback(
    (open: boolean) => {
      openRef.current = open;
      setIsOpen(open);
      Animated.spring(translateX, {
        toValue: open ? -ACTION_WIDTH : 0,
        damping: 20,
        stiffness: 240,
        mass: 0.7,
        useNativeDriver: false,
      }).start();
    },
    [translateX],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 8 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderGrant: () => {
          gestureStart.current = openRef.current ? -ACTION_WIDTH : 0;
          translateX.stopAnimation();
        },
        onPanResponderMove: (_, gesture) => {
          const next = Math.max(
            -ACTION_WIDTH,
            Math.min(0, gestureStart.current + gesture.dx),
          );
          translateX.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const projected = gestureStart.current + gesture.dx;
          settle(gesture.vx < -0.35 || projected < -ACTION_WIDTH * 0.42);
        },
        onPanResponderTerminate: () => settle(openRef.current),
      }),
    [settle, translateX],
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel={`Remove ${accessibilityName}`}
        accessibilityRole="button"
        importantForAccessibility={isOpen ? 'yes' : 'no-hide-descendants'}
        onPress={onRemove}
        style={styles.removeButton}>
        <Trash2 color={colors.white} size={20} strokeWidth={2.1} />
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.foreground, {transform: [{translateX}]}]}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    marginBottom: 12,
    overflow: 'hidden',
    backgroundColor: colors.danger,
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    marginTop: 6,
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  foreground: {backgroundColor: colors.background},
});
