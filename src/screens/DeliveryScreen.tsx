import React, {useState} from 'react';
import {ChevronRight, PackageOpen} from 'lucide-react-native';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {EmptyState} from '../components/common/EmptyState';
import {DeliveryDetailsModal} from '../components/delivery/DeliveryDetailsModal';
import {DeliveryProgress} from '../components/delivery/DeliveryProgress';
import {deliveryScreenStyles as styles} from '../styles/screens';
import {colors} from '../theme';
import {Delivery} from '../types/app';

type Props = {
  deliveries: Delivery[];
  onChangeStatus: (deliveryId: string, status: Delivery['status']) => void;
};

/** Lists deliveries and opens a complete order snapshot for each one. */
export const DeliveryScreen = ({deliveries, onChangeStatus}: Props) => {
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(
    null,
  );
  const selectedDelivery =
    deliveries.find(delivery => delivery.id === selectedDeliveryId) ?? null;

  return (
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
                  <View>
                    <View style={styles.cardHeader}>
                      <Text style={styles.orderId}>ORDER {delivery.id}</Text>
                      <View
                        style={[
                          styles.statusPill,
                          active && styles.activePill,
                        ]}>
                        <Text
                          style={[
                            styles.status,
                            active && styles.activeStatus,
                          ]}>
                          {delivery.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.deliveryTitle}>{delivery.title}</Text>
                    <Text style={styles.address}>{delivery.address}</Text>
                  </View>
                  <DeliveryProgress
                    onChangeStatus={status =>
                      onChangeStatus(delivery.id, status)
                    }
                    status={delivery.status}
                  />
                  <Pressable
                    accessibilityLabel={`View details for order ${delivery.id}`}
                    accessibilityRole="button"
                    onPress={() => setSelectedDeliveryId(delivery.id)}
                    style={({pressed}) => [
                      styles.viewDetailsRow,
                      pressed && styles.cardDetailsButtonPressed,
                    ]}>
                    <Text style={styles.viewDetailsLabel}>
                      View delivery details
                    </Text>
                    <ChevronRight
                      color={colors.goldSoft}
                      size={16}
                      strokeWidth={2}
                    />
                  </Pressable>
                  <Text style={styles.eta}>
                    {index === 0 && active
                      ? `ETA ${delivery.eta}`
                      : delivery.eta}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
      <DeliveryDetailsModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDeliveryId(null)}
      />
    </View>
  );
};
