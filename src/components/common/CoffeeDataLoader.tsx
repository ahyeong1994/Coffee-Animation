import React, {useState} from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import LottieView from 'lottie-react-native';
import {colors} from '../../theme';

type Props = {
  message?: string;
  style?: StyleProp<ViewStyle>;
};

/** Transparent loading state that can be embedded in a page content region. */
export const CoffeeDataLoader = ({
  message = 'Brewing your coffee…',
  style,
}: Props): JSX.Element => {
  const [animationFailed, setAnimationFailed] = useState(false);

  return (
    <View
      accessibilityLabel={message}
      accessibilityLiveRegion="polite"
      accessibilityRole="progressbar"
      style={[styles.container, style]}>
      {animationFailed ? (
        <View style={styles.fallback}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : (
        <LottieView
          autoPlay
          loop
          onAnimationFailure={() => setAnimationFailed(true)}
          resizeMode="contain"
          source={require('../../../assets/loading_coffee.json')}
          style={styles.animation}
        />
      )}
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.hint}>Just a moment</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  animation: {
    width: '78%',
    maxWidth: 300,
    aspectRatio: 1,
    flexGrow: 0,
    backgroundColor: 'transparent',
  },
  fallback: {
    width: '78%',
    maxWidth: 300,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  message: {
    marginTop: -8,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  hint: {
    marginTop: 7,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.7,
    textTransform: 'uppercase',
    color: colors.gold,
  },
});
