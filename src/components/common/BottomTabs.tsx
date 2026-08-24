import React from 'react';
import {
  Bike,
  Coffee,
  ShoppingBag,
  UserRound,
  type LucideIcon,
} from 'lucide-react-native';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {colors} from '../../theme';
import {AppTab} from '../../types/app';

type Props = {
  activeTab: AppTab;
  cartCount: number;
  onChange: (tab: AppTab) => void;
};

const tabs: {id: AppTab; label: string; Icon: LucideIcon}[] = [
  {id: 'order', label: 'Order', Icon: Coffee},
  {id: 'cart', label: 'Cart', Icon: ShoppingBag},
  {id: 'delivery', label: 'Delivery', Icon: Bike},
  {id: 'profile', label: 'Profile', Icon: UserRound},
];

export const BottomTabs = ({activeTab, cartCount, onChange}: Props) => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.bar}>
      {tabs.map(tab => {
        const active = activeTab === tab.id;
        const Icon = tab.Icon;
        return (
          <TouchableOpacity
            accessibilityLabel={`${tab.label} tab`}
            accessibilityRole="tab"
            accessibilityState={{selected: active}}
            activeOpacity={0.75}
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={styles.tab}>
            <View style={[styles.iconWrap, active && styles.activeIconWrap]}>
              <Icon
                color={active ? colors.background : colors.muted}
                size={18}
                strokeWidth={active ? 2.3 : 1.7}
              />
              {tab.id === 'cart' && cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, active && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  safeArea: {backgroundColor: colors.surface},
  bar: {
    height: 68,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    flexDirection: 'row',
    backgroundColor: colors.surface,
  },
  tab: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  iconWrap: {
    width: 36,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrap: {backgroundColor: colors.gold},
  label: {fontSize: 9, fontWeight: '700', color: colors.muted, marginTop: 3},
  activeLabel: {color: colors.goldSoft},
  badge: {
    position: 'absolute',
    top: -3,
    right: -5,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {fontSize: 9, fontWeight: '900', color: colors.white},
});
