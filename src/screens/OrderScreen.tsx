import React, {useRef, useState} from 'react';
import {ShoppingCart} from 'lucide-react-native';
import {
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Point, useCartFlightAnimation} from '../animations/cart';
import {useStickySearchAnimation} from '../animations/coffee';
import {AnimatedCoffeeCard} from '../components/coffee/AnimatedCoffeeCard';
import {CoffeeCategorySelector} from '../components/coffee/CoffeeCategorySelector';
import {CoffeeSearchField} from '../components/coffee/CoffeeSearchField';
import {FlyingCoffee} from '../components/coffee/FlyingCoffee';
import {coffeeCategories} from '../data/coffee';
import {useCoffeeCatalog} from '../hooks/useCoffeeCatalog';
import {colors, spacing} from '../theme';
import {Coffee} from '../types/app';

type Props = {
  onAdd: (coffee: Coffee) => void;
  cartCount: number;
  onOpenCart: () => void;
};

// SafeAreaView already clears the iOS notch. This additional platform spacing
// controls the visual breathing room beneath it for the sticky header controls.
const stickyHeaderTop = Platform.select({ios: 70, android: 12, default: 12});

/** Displays the searchable catalog and coordinates add-to-cart animations. */
export const OrderScreen = ({onAdd, cartCount, onOpenCart}: Props) => {
  const [viewportHeight, setViewportHeight] = useState(0);
  const cartButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const catalog = useCoffeeCatalog();
  const stickySearch = useStickySearchAnimation();
  const {cartScale, flight, launch, progress} = useCartFlightAnimation();

  const handleCoffeeAdd = (coffee: Coffee, origin: Point) => {
    const cartButton = cartButtonRef.current;
    if (!cartButton) {
      onAdd(coffee);
      return;
    }

    cartButton.measureInWindow((x, y, width, height) => {
      launch(
        coffee,
        origin,
        {x: x + width / 2, y: y + height / 2},
        // Update the cart and its red badge only after the coffee lands.
        () => onAdd(coffee),
      );
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={[
            styles.content,
            {paddingBottom: Math.max(160, viewportHeight * 0.4)},
          ]}
          keyboardShouldPersistTaps="handled"
          onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: stickySearch.scrollY}}}],
            {listener: stickySearch.handleScrollState, useNativeDriver: true},
          )}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>GOOD MORNING</Text>
              <Text style={styles.title}>Choose your{'\n'}daily ritual.</Text>
            </View>
          </View>

          <Animated.View
            pointerEvents={stickySearch.stickySearchVisible ? 'none' : 'auto'}
            style={[
              styles.fullSearch,
              {opacity: stickySearch.fullSearchOpacity},
            ]}>
            <CoffeeSearchField
              hiddenFromAccessibility={stickySearch.stickySearchVisible}
              onChangeText={catalog.setQuery}
              value={catalog.query}
            />
          </Animated.View>

          <CoffeeCategorySelector
            categories={coffeeCategories}
            onChange={catalog.setCategory}
            value={catalog.category}
          />

          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>Our coffee</Text>
            <Text style={styles.count}>
              {catalog.filteredCoffees.length}{' '}
              {catalog.filteredCoffees.length === 1
                ? 'selection'
                : 'selections'}
            </Text>
          </View>
          {catalog.filteredCoffees.map((coffee, index) => (
            <AnimatedCoffeeCard
              coffee={coffee}
              index={index}
              key={`${catalog.category}-${coffee.id}`}
              onAdd={origin => handleCoffeeAdd(coffee, origin)}
              scrollY={stickySearch.scrollY}
              viewportHeight={viewportHeight}
            />
          ))}
          {catalog.filteredCoffees.length === 0 ? (
            <Text style={styles.noResults}>No coffee matches your search.</Text>
          ) : null}
        </Animated.ScrollView>
        <Animated.View
          pointerEvents={stickySearch.stickySearchVisible ? 'auto' : 'none'}
          style={[
            styles.stickySearch,
            {
              opacity: stickySearch.stickySearchOpacity,
              transform: [{translateY: stickySearch.stickySearchTranslateY}],
            },
          ]}>
          <CoffeeSearchField
            compact
            hiddenFromAccessibility={!stickySearch.stickySearchVisible}
            onChangeText={catalog.setQuery}
            value={catalog.query}
          />
        </Animated.View>
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
    top: stickyHeaderTop,
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
  fullSearch: {marginTop: 26},
  stickySearch: {
    position: 'absolute',
    top: stickyHeaderTop,
    left: spacing.screen,
    right: spacing.screen + 54,
    zIndex: 19,
    elevation: 7,
  },
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
