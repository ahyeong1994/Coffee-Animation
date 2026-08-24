import React, {useEffect, useState} from 'react';
import {Minus, Plus} from 'lucide-react-native';
import {StyleSheet, TextInput, TouchableOpacity, View} from 'react-native';
import {colors} from '../../theme';

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export const QuantityControl = ({value, onChange}: Props) => {
  const [draft, setDraft] = useState(String(value));
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!editing) {
      setDraft(String(value));
    }
  }, [editing, value]);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 3);
    setDraft(digits);

    const nextValue = Number(digits);
    if (digits && nextValue > 0) {
      onChange(nextValue);
    }
  };

  const commit = () => {
    const nextValue = Number(draft);
    const validValue = nextValue > 0 ? Math.min(nextValue, 999) : 1;
    setEditing(false);
    setDraft(String(validValue));
    onChange(validValue);
  };

  const applyValue = (nextValue: number) => {
    const validValue = Math.max(1, Math.min(nextValue, 999));
    setDraft(String(validValue));
    onChange(validValue);
  };

  return (
    <View style={styles.control}>
      <TouchableOpacity
        accessibilityLabel="Decrease quantity"
        disabled={value <= 1}
        onPress={() => applyValue(value - 1)}
        style={[styles.button, value <= 1 && styles.disabledButton]}>
        <Minus color={colors.goldSoft} size={15} strokeWidth={2.3} />
      </TouchableOpacity>
      <TextInput
        accessibilityLabel="Quantity"
        keyboardType="number-pad"
        maxLength={3}
        onBlur={commit}
        onChangeText={handleChange}
        onFocus={() => setEditing(true)}
        onSubmitEditing={commit}
        returnKeyType="done"
        selectTextOnFocus
        selectionColor={colors.gold}
        style={styles.value}
        value={draft}
      />
      <TouchableOpacity
        accessibilityLabel="Increase quantity"
        disabled={value >= 999}
        onPress={() => applyValue(value + 1)}
        style={[styles.button, value >= 999 && styles.disabledButton]}>
        <Plus color={colors.goldSoft} size={15} strokeWidth={2.3} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  control: {
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {opacity: 0.35},
  value: {
    width: 38,
    height: 38,
    padding: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
});
