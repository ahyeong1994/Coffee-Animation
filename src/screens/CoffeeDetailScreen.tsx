import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, Check, MapPin, Star} from 'lucide-react-native';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {QuantityControl} from '../components/common/QuantityControl';
import {colors, spacing} from '../theme';
import {Coffee, CoffeeSize} from '../types/app';

const sizes: CoffeeSize[] = ['S', 'M', 'L'];

type Props = {
  coffee: Coffee;
  onAdd: (coffee: Coffee, size: CoffeeSize, quantity: number) => void;
  onBack: () => void;
};

/** Product detail route with size-aware pricing and quantity selection. */
export const CoffeeDetailScreen = ({coffee, onAdd, onBack}: Props) => {
  const [size, setSize] = useState<CoffeeSize>('M');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = useMemo(
    () => coffee.prices[size] * quantity,
    [coffee.prices, quantity, size],
  );

  useEffect(
    () => () => {
      if (addedTimerRef.current) {
        clearTimeout(addedTimerRef.current);
      }
    },
    [],
  );

  const handleAdd = () => {
    onAdd(coffee, size, quantity);
    setAdded(true);
    if (addedTimerRef.current) {
      clearTimeout(addedTimerRef.current);
    }
    addedTimerRef.current = setTimeout(() => setAdded(false), 1100);
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            accessibilityLabel="Back to coffee list"
            accessibilityRole="button"
            activeOpacity={0.72}
            onPress={onBack}
            style={styles.backButton}>
            <ArrowLeft color={colors.text} size={21} strokeWidth={1.8} />
          </TouchableOpacity>
          <Text style={styles.headerLabel}>COFFEE DETAILS</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.hero, {backgroundColor: coffee.accent}]}>
            <View style={styles.heroRingOuter} />
            <View style={styles.heroRingInner} />
            <Text style={styles.heroSymbol}>{coffee.symbol}</Text>
            <View style={styles.originPill}>
              <MapPin color={colors.goldSoft} size={11} strokeWidth={2} />
              <Text style={styles.origin}>{coffee.origin.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.category}>{coffee.category.toUpperCase()}</Text>
            <View style={styles.rating}>
              <Star color={colors.goldSoft} fill={colors.goldSoft} size={12} />
              <Text style={styles.ratingText}>{coffee.rating.toFixed(1)}</Text>
            </View>
          </View>

          <View style={styles.titleRow}>
            <View style={styles.titleCopy}>
              <Text style={styles.name}>{coffee.name}</Text>
              <Text style={styles.subtitle}>{coffee.subtitle}</Text>
            </View>
            <Text style={styles.price}>${coffee.prices[size].toFixed(2)}</Text>
          </View>

          <Text style={styles.description}>{coffee.description}</Text>

          <View style={styles.divider} />

          <View style={styles.optionsRow}>
            <View style={styles.sizeSection}>
              <Text style={styles.optionLabel}>SIZE</Text>
              <View style={styles.sizeRow}>
                {sizes.map(item => {
                  const selected = item === size;
                  return (
                    <TouchableOpacity
                      accessibilityLabel={`${item} size, $${coffee.prices[
                        item
                      ].toFixed(2)}`}
                      accessibilityRole="button"
                      accessibilityState={{selected}}
                      activeOpacity={0.75}
                      key={item}
                      onPress={() => setSize(item)}
                      style={[
                        styles.sizeButton,
                        selected && styles.sizeButtonSelected,
                      ]}>
                      <Text
                        style={[
                          styles.sizeText,
                          selected && styles.sizeTextSelected,
                        ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View>
              <Text style={styles.optionLabel}>QUANTITY</Text>
              <QuantityControl onChange={setQuantity} value={quantity} />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            accessibilityLabel={`Add ${quantity} ${size} ${
              coffee.name
            } to cart for $${total.toFixed(2)}`}
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={handleAdd}
            style={[styles.addButton, added && styles.addButtonComplete]}>
            {added ? (
              <>
                <Check color={colors.background} size={19} strokeWidth={2.5} />
                <Text style={styles.addButtonText}>Added to Cart</Text>
              </>
            ) : (
              <>
                <Text style={styles.addButtonText}>Add to Cart</Text>
                <Text style={styles.addButtonPrice}>${total.toFixed(2)}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  safeArea: {flex: 1},
  header: {
    height: 54,
    paddingHorizontal: spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.muted,
  },
  headerSpacer: {width: 40},
  content: {paddingHorizontal: spacing.screen, paddingBottom: 24},
  hero: {
    height: 286,
    marginTop: 8,
    marginBottom: 25,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRingOuter: {
    position: 'absolute',
    width: 235,
    height: 235,
    borderRadius: 118,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroRingInner: {
    position: 'absolute',
    width: 174,
    height: 174,
    borderRadius: 87,
    backgroundColor: 'rgba(13,13,15,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  heroSymbol: {fontSize: 92, color: colors.cream},
  originPill: {
    position: 'absolute',
    bottom: 17,
    paddingHorizontal: 12,
    height: 28,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13,13,15,0.56)',
  },
  origin: {
    marginLeft: 6,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: colors.cream,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    color: colors.gold,
  },
  rating: {flexDirection: 'row', alignItems: 'center'},
  ratingText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: '800',
    color: colors.goldSoft,
  },
  titleRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleCopy: {flex: 1, paddingRight: 12},
  name: {fontSize: 29, lineHeight: 34, fontWeight: '800', color: colors.text},
  subtitle: {marginTop: 3, fontSize: 11, color: colors.muted},
  price: {fontSize: 22, fontWeight: '900', color: colors.goldSoft},
  description: {
    marginTop: 18,
    fontSize: 12,
    lineHeight: 19,
    color: colors.muted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 22,
    backgroundColor: colors.border,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sizeSection: {flex: 1, marginRight: 20},
  optionLabel: {
    marginBottom: 10,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.8,
    color: colors.text,
  },
  sizeRow: {flexDirection: 'row'},
  sizeButton: {
    width: 42,
    height: 38,
    marginRight: 9,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeButtonSelected: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(201,166,107,0.12)',
  },
  sizeText: {fontSize: 12, fontWeight: '800', color: colors.muted},
  sizeTextSelected: {color: colors.goldSoft},
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  addButton: {
    height: 56,
    paddingHorizontal: 22,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gold,
  },
  addButtonComplete: {backgroundColor: colors.goldSoft},
  addButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.background,
  },
  addButtonPrice: {
    position: 'absolute',
    right: 22,
    fontSize: 14,
    fontWeight: '900',
    color: colors.background,
  },
});
