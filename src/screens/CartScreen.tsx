import React from 'react';
import {Coffee} from 'lucide-react-native';
import {SafeAreaView, ScrollView, StatusBar, Text, View} from 'react-native';
import {HoldToOrder} from '../components/cart/HoldToOrder';
import {SlideToOrder} from '../components/cart/SlideToOrder';
import {SwipeableCartItem} from '../components/cart/SwipeableCartItem';
import {EmptyState} from '../components/common/EmptyState';
import {AnimatedCoffeeIcon} from '../components/common/AnimatedCoffeeIcon';
import {QuantityControl} from '../components/common/QuantityControl';
import {cartScreenStyles as styles} from '../styles/screens';
import {colors} from '../theme';
import {CartLine, CheckoutMethod} from '../types/app';

type Props = {
  checkoutMethod: CheckoutMethod;
  lines: CartLine[];
  onBrowse: () => void;
  onCheckout: () => void;
  onChangeQuantity: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
};

/** Displays editable cart lines and the two experimental checkout controls. */
export const CartScreen = ({
  checkoutMethod,
  lines,
  onBrowse,
  onCheckout,
  onChangeQuantity,
  onRemove,
}: Props) => {
  const subtotal = lines.reduce(
    (total, line) => total + line.unitPrice * line.quantity,
    0,
  );
  const deliveryFee = lines.length > 0 ? 1.5 : 0;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>YOUR SELECTION</Text>
          <Text style={styles.title}>Cart</Text>
        </View>
        {lines.length === 0 ? (
          <EmptyState
            Icon={Coffee}
            action="Browse coffee"
            animatedIcon={
              <AnimatedCoffeeIcon
                color={colors.gold}
                size={32}
                strokeWidth={1.6}
              />
            }
            message="Your cart is waiting for something exceptional."
            onAction={onBrowse}
            title="Your cart is empty"
          />
        ) : (
          <>
            <ScrollView
              contentContainerStyle={styles.list}
              keyboardDismissMode="on-drag"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {lines.map(line => (
                <SwipeableCartItem
                  accessibilityName={line.coffee.name}
                  key={line.id}
                  onRemove={() => onRemove(line.id)}>
                  <View style={styles.line}>
                    <View
                      style={[
                        styles.visual,
                        {backgroundColor: line.coffee.accent},
                      ]}>
                      <Text style={styles.symbol}>{line.coffee.symbol}</Text>
                    </View>
                    <View style={styles.lineCopy}>
                      <View style={styles.lineTitleRow}>
                        <Text numberOfLines={1} style={styles.name}>
                          {line.coffee.name}
                        </Text>
                        <View style={styles.sizeBadge}>
                          <Text style={styles.sizeBadgeLabel}>SIZE</Text>
                          <Text style={styles.sizeBadgeValue}>{line.size}</Text>
                        </View>
                      </View>
                      <Text style={styles.subtitle}>
                        {line.coffee.subtitle}
                      </Text>
                      <View style={styles.lineFooter}>
                        <Text style={styles.price}>
                          ${(line.unitPrice * line.quantity).toFixed(2)}
                        </Text>
                        <QuantityControl
                          onChange={quantity =>
                            onChangeQuantity(line.id, quantity)
                          }
                          value={line.quantity}
                        />
                      </View>
                    </View>
                  </View>
                </SwipeableCartItem>
              ))}
            </ScrollView>
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery</Text>
                <Text style={styles.summaryValue}>
                  ${deliveryFee.toFixed(2)}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.total}>
                  ${(subtotal + deliveryFee).toFixed(2)}
                </Text>
              </View>
              {checkoutMethod === 'slide' ? (
                <SlideToOrder onComplete={onCheckout} />
              ) : (
                <HoldToOrder onComplete={onCheckout} />
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </View>
  );
};
