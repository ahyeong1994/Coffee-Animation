import React, {useEffect, useMemo, useRef, useState} from 'react';
import {ArrowLeft, Check, MapPin, Star} from 'lucide-react-native';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {QuantityControl} from '../components/common/QuantityControl';
import {coffeeDetailScreenStyles as styles} from '../styles/screens';
import {colors} from '../theme';
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
