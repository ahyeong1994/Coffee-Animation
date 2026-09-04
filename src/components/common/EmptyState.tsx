import React from 'react';
import {type LucideIcon} from 'lucide-react-native';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../theme';
import {AnimatedGlowButton} from './AnimatedGlowButton';

type Props = {
  Icon: LucideIcon;
  title: string;
  message: string;
  action?: string;
  onAction?: () => void;
};

export const EmptyState = ({Icon, title, message, action, onAction}: Props) => (
  <View style={styles.container}>
    <View style={styles.symbolWrap}>
      <Icon color={colors.gold} size={32} strokeWidth={1.6} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.message}>{message}</Text>
    {action && onAction ? (
      <AnimatedGlowButton label={action} onPress={onAction} />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbolWrap: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {fontSize: 21, fontWeight: '800', color: colors.text, marginTop: 20},
  message: {
    maxWidth: 270,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
    marginTop: 8,
  },
});
