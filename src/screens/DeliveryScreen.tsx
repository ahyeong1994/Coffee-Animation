import React from 'react';
import {PackageOpen} from 'lucide-react-native';
import {SafeAreaView, ScrollView, StatusBar, Text, View} from 'react-native';
import {EmptyState} from '../components/common/EmptyState';
import {DeliveryProgress} from '../components/delivery/DeliveryProgress';
import {deliveryScreenStyles as styles} from '../styles/screens';
import {colors} from '../theme';
import {Delivery} from '../types/app';

type Props = {
  deliveries: Delivery[];
  onChangeStatus: (deliveryId: string, status: Delivery['status']) => void;
};

/** Lists current deliveries and exposes temporary interactive status changes. */
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
