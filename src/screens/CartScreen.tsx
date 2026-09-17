import React from 'react';
import {Coffee} from 'lucide-react-native';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {HoldToOrder} from '../components/cart/HoldToOrder';
import {SlideToOrder} from '../components/cart/SlideToOrder';
import {SwipeableCartItem} from '../components/cart/SwipeableCartItem';
import {EmptyState} from '../components/common/EmptyState';
import {AnimatedCoffeeIcon} from '../components/common/AnimatedCoffeeIcon';
import {QuantityControl} from '../components/common/QuantityControl';
import {colors, spacing} from '../theme';
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

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  safeArea: {flex: 1},
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    paddingBottom: 18,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2.1,
    color: colors.gold,
  },
  title: {fontSize: 31, fontWeight: '800', color: colors.text, marginTop: 7},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 16},
  line: {
    minHeight: 132,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 10,
    flexDirection: 'row',
  },
  visual: {
    width: 102,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {fontSize: 38, color: colors.cream},
  lineCopy: {flex: 1, paddingHorizontal: 13, paddingVertical: 3},
  lineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    flex: 1,
    paddingRight: 8,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  sizeBadge: {
    height: 27,
    minWidth: 58,
    paddingHorizontal: 8,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: 'rgba(201,166,107,0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeBadgeLabel: {
    marginRight: 5,
    fontSize: 7,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: colors.gold,
  },
  sizeBadgeValue: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.goldSoft,
  },
  subtitle: {fontSize: 9, color: colors.muted, marginTop: 4},
  lineFooter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  price: {fontSize: 15, fontWeight: '800', color: colors.goldSoft},
  summary: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.screen,
    paddingTop: 18,
    paddingBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  summaryLabel: {fontSize: 11, color: colors.muted},
  summaryValue: {fontSize: 11, fontWeight: '700', color: colors.text},
  totalRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: 12,
    marginTop: 3,
  },
  totalLabel: {fontSize: 15, fontWeight: '800', color: colors.text},
  total: {fontSize: 20, fontWeight: '900', color: colors.goldSoft},
});
