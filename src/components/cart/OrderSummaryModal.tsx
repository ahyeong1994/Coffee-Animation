import React from 'react';
import {X} from 'lucide-react-native';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {colors, spacing} from '../../theme';
import {CartLine, CheckoutMethod} from '../../types/app';
import {HoldToOrder} from './HoldToOrder';
import {SlideToOrder} from './SlideToOrder';

type Props = {
  checkoutMethod: CheckoutMethod;
  deliveryFee: number;
  lines: CartLine[];
  onClose: () => void;
  onProcess: () => void;
  subtotal: number;
  visible: boolean;
};

/** Reviews the frozen cart details before exposing the final order control. */
export const OrderSummaryModal = ({
  checkoutMethod,
  deliveryFee,
  lines,
  onClose,
  onProcess,
  subtotal,
  visible,
}: Props) => {
  const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
  const total = subtotal + deliveryFee;

  return (
    <Modal
      animationType="fade"
      hardwareAccelerated
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}>
      <SafeAreaView style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close order summary"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View
          accessibilityLabel={`Order summary. ${itemCount} ${
            itemCount === 1 ? 'item' : 'items'
          }. Total $${total.toFixed(2)}.`}
          accessibilityViewIsModal
          style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>REVIEW YOUR ORDER</Text>
              <Text style={styles.title}>Order summary</Text>
            </View>
            <Pressable
              accessibilityLabel="Close order summary"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
              style={({pressed}) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}>
              <X color={colors.text} size={19} strokeWidth={1.8} />
            </Pressable>
          </View>

          <Text style={styles.itemCount}>
            {itemCount} {itemCount === 1 ? 'ITEM' : 'ITEMS'}
          </Text>
          <ScrollView
            contentContainerStyle={styles.items}
            showsVerticalScrollIndicator={false}
            style={styles.itemList}>
            {lines.map(line => (
              <View
                accessibilityLabel={`${line.coffee.name}, Size ${
                  line.size
                }, quantity ${line.quantity}, $${(
                  line.unitPrice * line.quantity
                ).toFixed(2)}`}
                key={line.id}
                style={styles.itemRow}>
                <View
                  style={[
                    styles.itemVisual,
                    {backgroundColor: line.coffee.accent},
                  ]}>
                  <Text style={styles.itemSymbol}>{line.coffee.symbol}</Text>
                </View>
                <View style={styles.itemCopy}>
                  <Text numberOfLines={1} style={styles.itemName}>
                    {line.coffee.name}
                  </Text>
                  <Text style={styles.itemMeta}>
                    Size {line.size} · Qty {line.quantity}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  ${(line.unitPrice * line.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.totals}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLineLabel}>Subtotal</Text>
              <Text style={styles.totalLineValue}>${subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={styles.totalLineLabel}>Delivery</Text>
              <Text style={styles.totalLineValue}>
                ${deliveryFee.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.totalLine, styles.grandTotalLine]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>

          <Text style={styles.processLabel}>PROCESS ORDER</Text>
          {checkoutMethod === 'slide' ? (
            <SlideToOrder onComplete={onProcess} />
          ) : (
            <HoldToOrder onComplete={onProcess} />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.54)',
  },
  backdrop: {...StyleSheet.absoluteFillObject},
  sheet: {
    height: '75%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.screen,
    paddingTop: 10,
    paddingBottom: 14,
  },
  handle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.8,
    color: colors.gold,
  },
  title: {
    marginTop: 5,
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonPressed: {opacity: 0.65, transform: [{scale: 0.95}]},
  itemCount: {
    marginTop: 20,
    marginBottom: 6,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.muted,
  },
  items: {paddingBottom: 3},
  itemList: {flex: 1},
  itemRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemVisual: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSymbol: {fontSize: 20, color: colors.cream},
  itemCopy: {flex: 1, paddingHorizontal: 11},
  itemName: {fontSize: 12, fontWeight: '800', color: colors.text},
  itemMeta: {marginTop: 4, fontSize: 9, color: colors.muted},
  itemPrice: {fontSize: 12, fontWeight: '800', color: colors.goldSoft},
  totals: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: colors.elevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7,
  },
  totalLineLabel: {fontSize: 10, color: colors.muted},
  totalLineValue: {fontSize: 10, fontWeight: '700', color: colors.text},
  grandTotalLine: {
    marginBottom: 0,
    marginTop: 2,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  grandTotalLabel: {fontSize: 14, fontWeight: '800', color: colors.text},
  grandTotalValue: {fontSize: 18, fontWeight: '900', color: colors.goldSoft},
  processLabel: {
    marginTop: 14,
    marginBottom: 7,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: colors.muted,
  },
});
