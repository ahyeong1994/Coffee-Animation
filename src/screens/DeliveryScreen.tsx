import React from 'react';
import {PackageOpen} from 'lucide-react-native';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {EmptyState} from '../components/common/EmptyState';
import {DeliveryProgress} from '../components/delivery/DeliveryProgress';
import {colors, spacing} from '../theme';
import {Delivery} from '../types/app';

type Props = {
  deliveries: Delivery[];
  onChangeStatus: (deliveryId: string, status: Delivery['status']) => void;
};

export const DeliveryScreen = ({deliveries, onChangeStatus}: Props) => (
  <View style={styles.screen}>
    <StatusBar barStyle="light-content" backgroundColor={colors.background} />
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>FROM BAR TO DOOR</Text>
        <Text style={styles.title}>Delivery</Text>
      </View>
      {deliveries.length === 0 ? (
        <EmptyState
          Icon={PackageOpen}
          message="Your coffee journeys will appear here."
          title="No deliveries yet"
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}>
          {deliveries.map((delivery, index) => {
            const active = delivery.status !== 'Delivered';
            return (
              <View
                key={delivery.id}
                style={[styles.card, active && styles.activeCard]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>ORDER {delivery.id}</Text>
                  <View
                    style={[styles.statusPill, active && styles.activePill]}>
                    <Text
                      style={[styles.status, active && styles.activeStatus]}>
                      {delivery.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.deliveryTitle}>{delivery.title}</Text>
                <Text style={styles.address}>{delivery.address}</Text>
                <DeliveryProgress
                  onChangeStatus={status => onChangeStatus(delivery.id, status)}
                  status={delivery.status}
                />
                <Text style={styles.eta}>
                  {index === 0 && active ? `ETA ${delivery.eta}` : delivery.eta}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  </View>
);

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  safeArea: {flex: 1},
  header: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    paddingBottom: 22,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2.1,
    color: colors.gold,
  },
  title: {fontSize: 31, fontWeight: '800', color: colors.text, marginTop: 7},
  list: {paddingHorizontal: spacing.screen, paddingBottom: 30},
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 20,
    marginBottom: 14,
  },
  activeCard: {borderColor: colors.gold},
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderId: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
    color: colors.muted,
  },
  statusPill: {
    height: 25,
    borderRadius: 13,
    backgroundColor: colors.elevated,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  activePill: {backgroundColor: '#25382A'},
  status: {fontSize: 9, fontWeight: '800', color: colors.muted},
  activeStatus: {color: '#91CF9D'},
  deliveryTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginTop: 18,
  },
  address: {fontSize: 10, color: colors.muted, marginTop: 5},
  eta: {fontSize: 10, fontWeight: '800', color: colors.goldSoft, marginTop: 22},
});
