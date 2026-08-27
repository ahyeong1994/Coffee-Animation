import React from 'react';
import {Check} from 'lucide-react-native';
import {StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from '../../../theme';

type Props = {
  error: string | null;
  savedMessageVisible: boolean;
};

/** Displays mutually exclusive save-success and permission-error feedback. */
export const PhotoFlowFeedback = ({error, savedMessageVisible}: Props) => {
  if (error) {
    return (
      <View style={styles.errorToast}>
        <Text style={styles.errorToastText}>{error}</Text>
      </View>
    );
  }

  if (!savedMessageVisible) {
    return null;
  }

  return (
    <View style={styles.savedToast}>
      <Check color={colors.background} size={17} strokeWidth={2.6} />
      <Text style={styles.savedToastText}>Saved to Noir Coffee album</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  savedToast: {
    position: 'absolute',
    bottom: 34,
    alignSelf: 'center',
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 23,
    backgroundColor: colors.gold,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 7},
    elevation: 12,
  },
  savedToastText: {
    marginLeft: 8,
    color: colors.background,
    fontSize: 10,
    fontWeight: '900',
  },
  errorToast: {
    position: 'absolute',
    bottom: 34,
    left: spacing.screen,
    right: spacing.screen,
    minHeight: 46,
    paddingHorizontal: 16,
    borderRadius: 23,
    backgroundColor: '#9B3333',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
  },
  errorToastText: {
    color: '#FFF7F1',
    textAlign: 'center',
    fontSize: 9,
    fontWeight: '800',
  },
});
