import React, {useState} from 'react';
import {
  Bell,
  ChevronRight,
  CreditCard,
  MapPin,
  type LucideIcon,
} from 'lucide-react-native';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CoffeePreferencesDropdown} from '../components/profile/CoffeePreferencesDropdown';
import {colors, spacing} from '../theme';

const menuItems: {Icon: LucideIcon; label: string; value: string}[] = [
  {Icon: MapPin, label: 'Delivery address', value: 'Home'},
  {Icon: CreditCard, label: 'Payment method', value: '•• 2048'},
];

export const ProfileScreen = () => {
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
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>FW</Text>
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.name}>Coffee Lover</Text>
              <Text style={styles.member}>GOLD MEMBER · 1,240 BEANS</Text>
            </View>
            <ChevronRight color={colors.gold} size={22} strokeWidth={1.8} />
          </View>

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
          </View>

          <Text style={styles.quote}>
            “Coffee is a quiet luxury, repeated daily.”
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: colors.background},
  safeArea: {flex: 1},
  content: {paddingBottom: 30},
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
  profileCard: {
    minHeight: 108,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.screen,
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {fontSize: 15, fontWeight: '900', color: colors.background},
  profileCopy: {flex: 1, marginLeft: 14},
  name: {fontSize: 17, fontWeight: '800', color: colors.text},
  member: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
    color: colors.gold,
    marginTop: 6,
  },
  menu: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.screen,
    marginTop: 18,
    overflow: 'hidden',
  },
  menuRow: {
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 12,
  },
  menuValue: {fontSize: 9, color: colors.muted},
  quote: {
    marginHorizontal: 30,
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
    fontStyle: 'italic',
    color: colors.muted,
  },
});
