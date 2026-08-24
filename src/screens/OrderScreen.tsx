import React, {useMemo, useRef, useState} from 'react';
import {Search, ShoppingCart} from 'lucide-react-native';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {CoffeeCard} from '../components/coffee/CoffeeCard';
import {FlyingCoffee} from '../components/coffee/FlyingCoffee';
import {coffeeCategories, coffees} from '../data/coffee';
import {Point, useCartFlightAnimation} from '../hooks/useCartFlightAnimation';
import {colors, spacing} from '../theme';
import {Coffee} from '../types/app';

type Props = {
  onAdd: (coffee: Coffee) => void;
  cartCount: number;
  onOpenCart: () => void;
};

export const OrderScreen = ({onAdd, cartCount, onOpenCart}: Props) => {
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const cartButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const {cartScale, flight, launch, progress} = useCartFlightAnimation();

  const filteredCoffees = useMemo(
    () =>
      coffees.filter(coffee => {
        const matchesCategory =
          category === 'All' || coffee.category === category;
        const searchable =
          `${coffee.name} ${coffee.subtitle} ${coffee.origin}`.toLowerCase();
        return (
          matchesCategory && searchable.includes(query.trim().toLowerCase())
        );
      }),
    [category, query],
  );

  const handleCoffeeAdd = (coffee: Coffee, origin: Point) => {
    onAdd(coffee);
    cartButtonRef.current?.measureInWindow((x, y, width, height) => {
      launch(coffee, origin, {x: x + width / 2, y: y + height / 2});
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>GOOD MORNING</Text>
              <Text style={styles.title}>Choose your{'\n'}daily ritual.</Text>
            </View>
          </View>

          <View style={styles.searchWrap}>
            <Search color={colors.gold} size={20} strokeWidth={1.8} />
            <TextInput
              accessibilityLabel="Search coffee"
              onChangeText={setQuery}
              placeholder="Search coffee or origin"
              placeholderTextColor={colors.muted}
              selectionColor={colors.gold}
              style={styles.search}
              value={query}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.categories}
            horizontal
            showsHorizontalScrollIndicator={false}>
            {coffeeCategories.map(item => {
              const active = category === item;
              return (
                <TouchableOpacity
                  accessibilityRole="button"
                  key={item}
                  onPress={() => setCategory(item)}
                  style={[styles.category, active && styles.activeCategory]}>
                  <Text
                    style={[
                      styles.categoryText,
                      active && styles.activeCategoryText,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Our coffee</Text>
            <Text style={styles.count}>
              {filteredCoffees.length} selections
            </Text>
          </View>
          {filteredCoffees.map(coffee => (
            <CoffeeCard
              coffee={coffee}
              key={coffee.id}
              onAdd={origin => handleCoffeeAdd(coffee, origin)}
            />
          ))}
          {filteredCoffees.length === 0 ? (
            <Text style={styles.noResults}>No coffee matches your search.</Text>
          ) : null}
        </ScrollView>
        <Animated.View
          style={[
            styles.cartButtonContainer,
            {transform: [{scale: cartScale}]},
          ]}>
          <TouchableOpacity
            ref={cartButtonRef}
            accessibilityLabel={`Open cart, ${cartCount} items`}
            accessibilityRole="button"
            activeOpacity={0.75}
            onPress={onOpenCart}
            style={styles.cartButton}>
            <ShoppingCart color={colors.goldSoft} size={21} strokeWidth={1.8} />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </Animated.View>
        <FlyingCoffee flight={flight} progress={progress} />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  safeArea: {flex: 1},
  content: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2.2,
    color: colors.gold,
  },
  title: {
    fontSize: 31,
    lineHeight: 35,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: colors.text,
    marginTop: 8,
  },
  cartButtonContainer: {
    position: 'absolute',
    top: 12,
    right: spacing.screen,
    zIndex: 20,
    elevation: 8,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {fontSize: 9, fontWeight: '900', color: colors.white},
  searchWrap: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 26,
    paddingHorizontal: 16,
  },
  search: {
    flex: 1,
    height: 52,
    padding: 0,
    paddingLeft: 10,
    fontSize: 12,
    color: colors.text,
  },
  categories: {paddingVertical: 18},
  category: {
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 17,
    justifyContent: 'center',
    marginRight: 8,
  },
  activeCategory: {backgroundColor: colors.gold, borderColor: colors.gold},
  categoryText: {fontSize: 10, fontWeight: '800', color: colors.muted},
  activeCategoryText: {color: colors.background},
  listHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 13,
  },
  listTitle: {fontSize: 19, fontWeight: '800', color: colors.text},
  count: {fontSize: 9, color: colors.muted},
  noResults: {
    paddingVertical: 80,
    textAlign: 'center',
    fontSize: 12,
    color: colors.muted,
  },
});
