import React, {useState} from 'react';
import {
  Bell,
  ChevronRight,
  CreditCard,
  MapPin,
  MoveRight,
  type LucideIcon,
} from 'lucide-react-native';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CoffeePreferencesDropdown} from '../components/profile/CoffeePreferencesDropdown';
import {profileScreenStyles as styles} from '../styles/screens';
import {colors} from '../theme';
import {CheckoutMethod} from '../types/app';

const menuItems: {Icon: LucideIcon; label: string; value: string}[] = [
  {Icon: MapPin, label: 'Delivery address', value: 'Home'},
  {Icon: CreditCard, label: 'Payment method', value: '•• 2048'},
];

type Props = {
  checkoutMethod: CheckoutMethod;
  onChangeCheckoutMethod: (method: CheckoutMethod) => void;
  onOpenCoffeeCamera: () => void;
};

/** Renders account settings and opens the Coffee Lover camera experience. */
export const ProfileScreen = ({
  checkoutMethod,
  onChangeCheckoutMethod,
  onOpenCoffeeCamera,
}: Props) => {
  const [notifications, setNotifications] = useState(true);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.eyebrow}>YOUR SPACE</Text>
            <Text style={styles.title}>Profile</Text>
          </View>
          <TouchableOpacity
            accessibilityHint="Opens your animated coffee camera"
            accessibilityLabel="Coffee Lover profile"
            accessibilityRole="button"
            activeOpacity={0.78}
            onPress={onOpenCoffeeCamera}
            style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>FW</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.name}>Coffee Lover</Text>
              <Text style={styles.member}>GOLD MEMBER · 1,240 BEANS</Text>
            </View>
            <ChevronRight color={colors.gold} size={22} strokeWidth={1.8} />
          </TouchableOpacity>

          <View style={styles.menu}>
            {menuItems.map(item => {
              const Icon = item.Icon;
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={item.label}
                  style={styles.menuRow}>
                  <View style={styles.menuIcon}>
                    <Icon color={colors.goldSoft} size={16} strokeWidth={1.7} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuValue}>{item.value}</Text>
                  <ChevronRight
                    color={colors.muted}
                    size={17}
                    strokeWidth={1.7}
                  />
                </TouchableOpacity>
              );
            })}
            <CoffeePreferencesDropdown />
            <View style={styles.menuRow}>
              <View style={styles.menuIcon}>
                <Bell color={colors.goldSoft} size={16} strokeWidth={1.7} />
              </View>
              <Text style={styles.menuLabel}>Order notifications</Text>
              <Switch
                accessibilityLabel="Order notifications"
                onValueChange={setNotifications}
                thumbColor={notifications ? colors.background : colors.muted}
                trackColor={{false: colors.elevated, true: colors.gold}}
                value={notifications}
              />
            </View>
            <View style={styles.menuRow}>
              <View style={styles.menuIcon}>
                <MoveRight
                  color={colors.goldSoft}
                  size={16}
                  strokeWidth={1.7}
                />
              </View>
              <Text style={styles.menuLabel}>Checkout interaction</Text>
              <Text style={styles.menuValue}>
                {checkoutMethod === 'hold' ? 'HOLD' : 'SLIDE'}
              </Text>
              <Switch
                accessibilityHint="Turn on for hold to order, or off for slide to order"
                accessibilityLabel="Checkout interaction"
                onValueChange={useHold =>
                  onChangeCheckoutMethod(useHold ? 'hold' : 'slide')
                }
                thumbColor={
                  checkoutMethod === 'hold' ? colors.background : colors.muted
                }
                trackColor={{false: colors.elevated, true: colors.gold}}
                value={checkoutMethod === 'hold'}
              />
            </View>
          </View>

          <Text style={styles.quote}>
            “Coffee is a quiet luxury, repeated daily.”
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
