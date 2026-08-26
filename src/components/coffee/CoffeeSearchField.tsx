import React from 'react';
import {Search, X} from 'lucide-react-native';
import {
  StyleProp,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {colors} from '../../theme';

type Props = {
  compact?: boolean;
  hiddenFromAccessibility?: boolean;
  onChangeText: (value: string) => void;
  style?: StyleProp<ViewStyle>;
  value: string;
};

export const CoffeeSearchField = ({
  compact = false,
  hiddenFromAccessibility = false,
  onChangeText,
  style,
  value,
}: Props) => (
  <View
    importantForAccessibility={
      hiddenFromAccessibility ? 'no-hide-descendants' : 'auto'
    }
    style={[styles.container, compact && styles.compactContainer, style]}>
    <Search color={colors.gold} size={compact ? 18 : 20} strokeWidth={1.8} />
    <TextInput
      accessibilityLabel="Search coffee"
      onChangeText={onChangeText}
      placeholder={compact ? 'Search coffee' : 'Search coffee or origin'}
      placeholderTextColor={colors.muted}
      selectionColor={colors.gold}
      style={[styles.input, compact && styles.compactInput]}
      value={value}
    />
    {value.length > 0 ? (
      <TouchableOpacity
        accessibilityLabel="Clear coffee search"
        accessibilityRole="button"
        activeOpacity={0.65}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        onPress={() => onChangeText('')}
        style={[styles.clear, compact && styles.compactClear]}>
        <X color={colors.muted} size={compact ? 16 : 18} strokeWidth={2} />
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  compactContainer: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: 13,
    backgroundColor: colors.background,
    borderColor: colors.gold,
  },
  input: {
    flex: 1,
    height: 52,
    padding: 0,
    paddingLeft: 10,
    fontSize: 12,
    color: colors.text,
  },
  compactInput: {height: 44, fontSize: 10, paddingLeft: 8},
  clear: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactClear: {width: 26, height: 26, borderRadius: 13},
});
