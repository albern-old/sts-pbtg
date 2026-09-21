import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Heart, X } from 'lucide-react-native';
import { HeartRateZone } from '../types';

interface HeartRateZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  age: number;
  maxHeartRate: number;
  zones: HeartRateZone[];
}

export const HeartRateZonesModal: React.FC<HeartRateZonesModalProps> = ({
  isOpen,
  onClose,
  age,
  maxHeartRate,
  zones,
}) => {
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <View style={styles.heartIconBox}>
                <Heart size={20} color="#EF4444" fill="#EF4444" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Zona Detak Jantung Latihan</Text>
                <Text style={styles.modalSubtitle}>
                  Usia {age} thn • Denyut Maksimum:{' '}
                  <Text style={{ fontWeight: '800', color: '#0F172A' }}>
                    {maxHeartRate} BPM
                  </Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* List 5 Zones */}
          <ScrollView style={styles.zonesScroll} showsVerticalScrollIndicator={false}>
            {zones.map((zone) => (
              <View key={zone.zone} style={styles.zoneItem}>
                <View style={styles.zoneTopRow}>
                  <View style={styles.zoneNameGroup}>
                    <View
                      style={[styles.zoneBadge, { backgroundColor: zone.color }]}
                    >
                      <Text style={styles.zoneBadgeText}>Z{zone.zone}</Text>
                    </View>
                    <Text style={styles.zoneNameText}>{zone.name}</Text>
                  </View>

                  <View style={styles.zoneBpmGroup}>
                    <Text style={styles.bpmRangeText}>{zone.bpmRange}</Text>
                    <Text style={styles.percentText}>{zone.rangePercentage}</Text>
                  </View>
                </View>

                <View style={styles.zoneBottomRow}>
                  <View
                    style={[
                      styles.intensityPill,
                      { backgroundColor: `${zone.color}20` },
                    ]}
                  >
                    <Text
                      style={[styles.intensityText, { color: zone.color }]}
                    >
                      {zone.intensity}
                    </Text>
                  </View>
                  <Text style={styles.descText}>{zone.description}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

          {/* Bottom Action */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>Tutup Panduan Zona</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  heartIconBox: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zonesScroll: {
    marginVertical: 12,
  },
  zoneItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  zoneTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  zoneNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  zoneBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  zoneNameText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  zoneBpmGroup: {
    alignItems: 'flex-end',
  },
  bpmRangeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  percentText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  zoneBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  intensityPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  intensityText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  descText: {
    fontSize: 10,
    color: '#64748B',
    flex: 1,
    textAlign: 'right',
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
