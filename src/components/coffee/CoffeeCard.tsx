import React from 'react';
import {Plus, Star} from 'lucide-react-native';
import {Animated, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {colors} from '../../theme';
import {Coffee} from '../../types/app';
import {Point} from '../../animations/cart/useCartFlightAnimation';

type Props = {
  coffee: Coffee;
  onAdd: (origin: Point) => void;
  visualParallaxY?: Animated.AnimatedInterpolation<number>;
};

export const CoffeeCard = ({coffee, onAdd, visualParallaxY}: Props) => {
  const addButtonRef =
    React.useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  const handleAdd = () => {
    addButtonRef.current?.measureInWindow((x, y, width, height) => {
      onAdd({x: x + width / 2, y: y + height / 2});
    });
  };

  return (
    <View style={styles.card}>
      <View style={[styles.visual, {backgroundColor: coffee.accent}]}>
        <Animated.View
          style={[
            styles.visualContent,
            visualParallaxY
              ? {transform: [{translateY: visualParallaxY}]}
              : undefined,
          ]}>
          <View style={styles.halo} />
          <Text style={styles.symbol}>{coffee.symbol}</Text>
          <Text style={styles.origin}>{coffee.origin.toUpperCase()}</Text>
        </Animated.View>
      </View>
      <View style={styles.copy}>
        <View>
          <View style={styles.ratingRow}>
            <View style={styles.ratingWrap}>
              <Star color={colors.goldSoft} fill={colors.goldSoft} size={10} />
              <Text style={styles.rating}>{coffee.rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.category}>{coffee.category}</Text>
          </View>
          <Text style={styles.name}>{coffee.name}</Text>
          <Text style={styles.subtitle}>{coffee.subtitle}</Text>
        </View>
        <View style={styles.footer}>
          <Text style={styles.price}>${coffee.price.toFixed(2)}</Text>
          <TouchableOpacity
            ref={addButtonRef}
            accessibilityLabel={`Add ${coffee.name} to cart`}
            accessibilityRole="button"
            activeOpacity={0.8}
            onPress={handleAdd}
            style={styles.addButton}>
            <Plus color={colors.background} size={21} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 180,
    borderRadius: 24,
    padding: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    marginBottom: 14,
  },
  visual: {
    width: '41%',
    borderRadius: 18,
    overflow: 'hidden',
  },
  visualContent: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  symbol: {fontSize: 58, color: colors.cream},
  origin: {
    position: 'absolute',
    bottom: 12,
    fontSize: 8,
    letterSpacing: 1.4,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.68)',
  },
  copy: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 14,
    justifyContent: 'space-between',
  },
  ratingRow: {flexDirection: 'row', justifyContent: 'space-between'},
  ratingWrap: {flexDirection: 'row', alignItems: 'center'},
  rating: {fontSize: 9, fontWeight: '800', color: colors.goldSoft},
  category: {fontSize: 9, color: colors.muted},
  name: {
    fontSize: 18,
    lineHeight: 21,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
  },
  subtitle: {fontSize: 10, lineHeight: 15, color: colors.muted, marginTop: 5},
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {fontSize: 17, fontWeight: '800', color: colors.cream},
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
