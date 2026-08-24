import React, {useRef, useState} from 'react';
import {Check, ChevronDown, SlidersHorizontal} from 'lucide-react-native';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../theme';

const preferences = [
  {label: 'Light roast', note: 'Bright · floral · crisp'},
  {label: 'Medium roast', note: 'Balanced · smooth · sweet'},
  {label: 'Dark roast', note: 'Bold · smoky · intense'},
];

const OPTION_HEIGHT = 50;

export const CoffeePreferencesDropdown = () => {
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState('Medium roast');
  const progress = useRef(new Animated.Value(0)).current;

  const setOpen = (open: boolean) => {
    setExpanded(open);
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: open ? 280 : 220,
      easing: open ? Easing.out(Easing.cubic) : Easing.inOut(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  const selectPreference = (preference: string) => {
    setSelected(preference);
    setOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityLabel={`Coffee preferences, ${selected}`}
        accessibilityRole="button"
        accessibilityState={{expanded}}
        activeOpacity={0.72}
        onPress={() => setOpen(!expanded)}
        style={styles.menuRow}>
        <View style={styles.menuIcon}>
          <SlidersHorizontal
            color={colors.goldSoft}
            size={16}
            strokeWidth={1.7}
          />
        </View>
        <Text style={styles.menuLabel}>Coffee preferences</Text>
        <Text style={styles.menuValue}>{selected}</Text>
        <Animated.View
          style={{
            transform: [
              {
                rotate: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              },
            ],
          }}>
          <ChevronDown color={colors.muted} size={17} strokeWidth={1.7} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        pointerEvents={expanded ? 'auto' : 'none'}
        style={[
          styles.dropdown,
          {
            height: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, preferences.length * OPTION_HEIGHT],
            }),
            opacity: progress,
          },
        ]}>
        <Animated.View
          style={{
            transform: [
              {
                translateY: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
            ],
          }}>
          {preferences.map(preference => {
            const active = selected === preference.label;
            return (
              <TouchableOpacity
                accessibilityRole="radio"
                accessibilityState={{checked: active}}
                activeOpacity={0.7}
                key={preference.label}
                onPress={() => selectPreference(preference.label)}
                style={[styles.option, active && styles.activeOption]}>
                <View style={styles.optionCopy}>
                  <Text
                    style={[styles.optionLabel, active && styles.activeLabel]}>
                    {preference.label}
                  </Text>
                  <Text style={styles.optionNote}>{preference.note}</Text>
                </View>
                {active ? (
                  <View style={styles.check}>
                    <Check
                      color={colors.background}
                      size={13}
                      strokeWidth={2.5}
                    />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  menuRow: {
    minHeight: 64,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  menuValue: {fontSize: 9, color: colors.muted, marginRight: 5},
  dropdown: {overflow: 'hidden', backgroundColor: colors.background},
  option: {
    height: OPTION_HEIGHT,
    paddingLeft: 60,
    paddingRight: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  activeOption: {backgroundColor: 'rgba(201,166,107,0.08)'},
  optionCopy: {flex: 1},
  optionLabel: {fontSize: 10, fontWeight: '700', color: colors.text},
  activeLabel: {color: colors.goldSoft},
  optionNote: {fontSize: 8, color: colors.muted, marginTop: 3},
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
