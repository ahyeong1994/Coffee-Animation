import React from 'react';
import {Camera} from 'lucide-react-native';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../../theme';

/** Explains the page-wide gesture before the user opens the camera. */
export const CoffeeCameraEmptyState = () => (
  <View style={styles.container}>
    <View style={styles.icon}>
      <Camera color={colors.gold} size={27} strokeWidth={1.5} />
    </View>
    <Text style={styles.title}>Pull down the camera</Text>
    <Text style={styles.message}>
      Pull down anywhere on this screen, frame your coffee, then press the
      shutter to print a memory.
    </Text>
    <View style={styles.pullHint}>
      <View style={styles.pullHintLine} />
      <Text style={styles.pullHintText}>PULL DOWN ANYWHERE</Text>
      <View style={styles.pullHintLine} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {alignItems: 'center', paddingTop: 70, maxWidth: 300},
  icon: {
    width: 62,
    height: 62,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  message: {
    marginTop: 9,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 17,
    color: colors.muted,
  },
  pullHint: {marginTop: 26, flexDirection: 'row', alignItems: 'center'},
  pullHintLine: {width: 34, height: 1, backgroundColor: colors.border},
  pullHintText: {
    marginHorizontal: 10,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.gold,
  },
});
