import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Heart, X, Sparkles, Activity } from 'lucide-react-native';
import { Gender, HeartRateZone } from '../types';
interface HeartRateZonesModalProps {
  isOpen: boolean;
  onClose: () => void;
  age: number;
  maxHeartRate: number;
  zones: HeartRateZone[];
  gender?: Gender;
  formulaName?: string;
}

export const HeartRateZonesModal: React.FC<HeartRateZonesModalProps> = ({
  isOpen,
  onClose,
  age,
  maxHeartRate,
  zones,
  gender = 'male',
  formulaName,
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
              <View style={{ flex: 1 }}>
                <View style={styles.headerTagRow}>
                  <Text style={styles.modalTitle}>Zona Detak Jantung Latihan</Text>
                  <View style={styles.genderBadge}>
                    <Text style={styles.genderBadgeText}>
                      {gender === 'male' ? '♂ PRIA' : '♀ WANITA'}
                    </Text>
                  </View>
                </View>
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

          {/* Formula Attribution Banner */}
          <View style={styles.formulaBanner}>
            <Activity size={13} color="#6366F1" />
            <Text style={styles.formulaText}>
              {formulaName ||
                (gender === 'female'
                  ? 'Formula Klinis Gulati (Standar Wanita: 206 - 0.88×Usia)'
                  : 'Formula Tanaka (Standar Pria: 208 - 0.7×Usia)')}
            </Text>
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

                {/* Gender Specific Physiological Coaching Tip */}
                {zone.genderTip && (
                  <View style={styles.genderTipBox}>
                    <Sparkles size={11} color="#2563EB" />
                    <Text style={styles.genderTipText}>
                      <Text style={{ fontWeight: '800' }}>
                        Fisiologi {gender === 'male' ? 'Pria' : 'Wanita'}:{' '}
                      </Text>
                      {zone.genderTip}
                    </Text>
                  </View>
                )}
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
    borderRadius: 24,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  heartIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  genderBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  genderBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  formulaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  formulaText: {
    color: '#4338CA',
    fontSize: 9.5,
    fontWeight: '700',
    flex: 1,
  },
  zonesScroll: {
    marginVertical: 4,
  },
  zoneItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  zoneTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  zoneNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  zoneBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },
  zoneBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  zoneNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  zoneBpmGroup: {
    alignItems: 'flex-end',
  },
  bpmRangeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  percentText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  zoneBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  intensityPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  intensityText: {
    fontSize: 9,
    fontWeight: '700',
  },
  descText: {
    fontSize: 10,
    color: '#475569',
    flex: 1,
    lineHeight: 13,
  },
  genderTipBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 5,
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    padding: 5,
    borderRadius: 6,
  },
  genderTipText: {
    fontSize: 9.5,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 13,
  },
  doneBtn: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  doneBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
