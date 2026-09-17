import React, {useRef, useState} from 'react';
import {ShoppingCart} from 'lucide-react-native';
import {
  Animated,
  SafeAreaView,
  StatusBar,
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
import {orderScreenStyles as styles} from '../styles/screens';
import {colors} from '../theme';
import {Coffee} from '../types/app';

type Props = {
  onAdd: (coffee: Coffee) => void;
  cartCount: number;
  onOpenDetail: (coffee: Coffee) => void;
  onOpenCart: () => void;
};

/** Displays the searchable catalog and coordinates add-to-cart animations. */
export const OrderScreen = ({
  onAdd,
  cartCount,
  onOpenDetail,
  onOpenCart,
}: Props) => {
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
              onPress={() => onOpenDetail(coffee)}
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
