import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart3, Calculator, Footprints, Home } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { fonts } from '../theme/typography';

export type TabKey = 'home' | 'calculator' | 'tracker' | 'history';

const TABS: { key: TabKey; label: string; renderIcon: (color: string) => React.ReactNode }[] = [
  { key: 'home', label: 'Beranda', renderIcon: (color) => <Home size={20} color={color} /> },
  {
    key: 'calculator',
    label: 'Kalkulator BMI',
    renderIcon: (color) => <Calculator size={20} color={color} />,
  },
  {
    key: 'tracker',
    label: 'Aktivitas GPS',
    renderIcon: (color) => <Footprints size={20} color={color} />,
  },
  {
    key: 'history',
    label: 'Riwayat',
    renderIcon: (color) => <BarChart3 size={20} color={color} />,
  },
];

// Tab bar bawah sesuai desain "Langkah." — layar menyediakan sendiri header (BrandHeader).
export const RootTabs: React.FC<{
  active: TabKey;
  onChange: (tab: TabKey) => void;
  children: React.ReactNode;
}> = ({ active, onChange, children }) => (
  <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
    <View style={styles.body}>{children}</View>

    <View style={styles.tabBar}>
      {TABS.map((tab) => {
        const selected = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selected && styles.tabActive]}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.85}
          >
            {tab.renderIcon(selected ? colors.onPrimary : colors.onSurfaceVariant)}
            <Text
              numberOfLines={1}
              style={[styles.tabLabel, selected && styles.tabLabelActive]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  body: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 12,
    marginBottom: 6,
    marginTop: 2,
    backgroundColor: colors.surfaceLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 24,
    padding: 6,
    shadowColor: '#0B1C30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: 9,
    borderRadius: 18,
  },
  tabActive: { backgroundColor: colors.primary },
  tabLabel: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  tabLabelActive: { color: colors.onPrimary },
});
