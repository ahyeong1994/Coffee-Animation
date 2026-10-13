import React from 'react';
import {MapPin, X} from 'lucide-react-native';
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
import {Delivery} from '../../types/app';

type Props = {
  delivery: Delivery | null;
  onClose: () => void;
};

const steps: Delivery['status'][] = ['Brewing', 'Arriving', 'Delivered'];

/** Shows the immutable order snapshot associated with a delivery. */
export const DeliveryDetailsModal = ({delivery, onClose}: Props) => {
  if (!delivery) {
    return null;
  }

  const activeStep = steps.indexOf(delivery.status);
  const total = delivery.subtotal + delivery.deliveryFee;

  return (
    <Modal
      animationType="fade"
      hardwareAccelerated
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible>
      <SafeAreaView style={styles.overlay}>
        <Pressable
          accessibilityLabel="Close delivery details"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          accessibilityLabel={`Delivery details for order ${delivery.id}`}
          accessibilityViewIsModal
          style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>ORDER {delivery.id}</Text>
              <Text style={styles.title}>Delivery details</Text>
            </View>
            <Pressable
              accessibilityLabel="Close delivery details"
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

          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.status}>{delivery.status}</Text>
              <Text style={styles.eta}>
                {delivery.status === 'Delivered'
                  ? delivery.eta
                  : `ETA ${delivery.eta}`}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              {steps.map((step, index) => (
                <React.Fragment key={step}>
                  <View
                    style={[
                      styles.progressDot,
                      index <= activeStep && styles.progressDotComplete,
                    ]}
                  />
                  {index < steps.length - 1 ? (
                    <View
                      style={[
                        styles.progressLine,
                        index < activeStep && styles.progressLineComplete,
                      ]}
                    />
                  ) : null}
                </React.Fragment>
              ))}
            </View>
            <View style={styles.progressLabels}>
              {steps.map((step, index) => (
                <Text
                  key={step}
                  style={[
                    styles.progressLabel,
                    index <= activeStep && styles.progressLabelComplete,
                  ]}>
                  {step}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.addressRow}>
            <View style={styles.addressIcon}>
              <MapPin color={colors.goldSoft} size={17} strokeWidth={1.9} />
            </View>
            <View style={styles.addressCopy}>
              <Text style={styles.sectionLabel}>DELIVER TO</Text>
              <Text style={styles.address}>{delivery.address}</Text>
            </View>
          </View>

          <Text style={styles.sectionLabel}>ORDER ITEMS</Text>
          <ScrollView
            contentContainerStyle={styles.items}
            showsVerticalScrollIndicator={false}
            style={styles.itemList}>
            {delivery.items.map(item => (
              <View
                accessibilityLabel={`${item.name}, Size ${
                  item.size
                }, quantity ${item.quantity}, $${(
                  item.unitPrice * item.quantity
                ).toFixed(2)}`}
                key={item.id}
                style={styles.itemRow}>
                <View
                  style={[styles.itemVisual, {backgroundColor: item.accent}]}>
                  <Text style={styles.itemSymbol}>{item.symbol}</Text>
                </View>
                <View style={styles.itemCopy}>
                  <Text numberOfLines={1} style={styles.itemName}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemMeta}>
                    Size {item.size} · Qty {item.quantity}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.totals}>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                ${delivery.subtotal.toFixed(2)}
              </Text>
            </View>
            <View style={styles.totalLine}>
              <Text style={styles.totalLabel}>Delivery</Text>
              <Text style={styles.totalValue}>
                ${delivery.deliveryFee.toFixed(2)}
              </Text>
            </View>
            <View style={[styles.totalLine, styles.grandTotalLine]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
            </View>
          </View>
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
    height: '70%',
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
    letterSpacing: 1.6,
    color: colors.gold,
  },
  title: {marginTop: 5, fontSize: 24, fontWeight: '800', color: colors.text},
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
  statusCard: {
    marginTop: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.elevated,
    padding: 14,
  },
  statusHeader: {flexDirection: 'row', justifyContent: 'space-between'},
  status: {fontSize: 12, fontWeight: '900', color: colors.goldSoft},
  eta: {fontSize: 9, fontWeight: '700', color: colors.muted},
  progressTrack: {flexDirection: 'row', alignItems: 'center', marginTop: 16},
  progressDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  progressDotComplete: {borderColor: colors.gold, backgroundColor: colors.gold},
  progressLine: {height: 1, flex: 1, backgroundColor: colors.border},
  progressLineComplete: {backgroundColor: colors.gold},
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  progressLabel: {fontSize: 8, color: colors.muted},
  progressLabelComplete: {color: colors.goldSoft},
  addressRow: {flexDirection: 'row', alignItems: 'center', marginVertical: 16},
  addressIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressCopy: {flex: 1, marginLeft: 11},
  sectionLabel: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: colors.muted,
  },
  address: {fontSize: 11, fontWeight: '700', color: colors.text, marginTop: 4},
  itemList: {flex: 1, marginTop: 5},
  items: {paddingBottom: 3},
  itemRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  itemVisual: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSymbol: {fontSize: 19, color: colors.cream},
  itemCopy: {flex: 1, paddingHorizontal: 11},
  itemName: {fontSize: 12, fontWeight: '800', color: colors.text},
  itemMeta: {marginTop: 4, fontSize: 9, color: colors.muted},
  itemPrice: {fontSize: 12, fontWeight: '800', color: colors.goldSoft},
  totals: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: colors.elevated,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: {fontSize: 10, color: colors.muted},
  totalValue: {fontSize: 10, fontWeight: '700', color: colors.text},
  grandTotalLine: {
    marginBottom: 0,
    marginTop: 2,
    paddingTop: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  grandTotalLabel: {fontSize: 14, fontWeight: '800', color: colors.text},
  grandTotalValue: {fontSize: 18, fontWeight: '900', color: colors.goldSoft},
});
