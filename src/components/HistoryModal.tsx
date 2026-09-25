import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  X,
  Trash2,
  Calendar,
  Clock,
  Flame,
  MapPin,
  Scale,
  ClipboardList,
  CheckCircle2,
  Activity,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react-native';
import { BmiHistoryRecord, ActivityHistoryRecord } from '../types';
import { WorkoutAnalysisModal } from './WorkoutAnalysisModal';
interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  bmiHistory: BmiHistoryRecord[];
  activityHistory: ActivityHistoryRecord[];
  onDeleteBmiItem: (id: string) => void;
  onClearAllBmi: () => void;
  onDeleteActivityItem: (id: string) => void;
  onClearAllActivity: () => void;
  onRestoreBmiRecord: (record: BmiHistoryRecord) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  bmiHistory,
  activityHistory,
  onDeleteBmiItem,
  onClearAllBmi,
  onDeleteActivityItem,
  onClearAllActivity,
  onRestoreBmiRecord,
}) => {

  const [activeTab, setActiveTab] = useState<'bmi' | 'activity'>('bmi');
  const [selectedWorkout, setSelectedWorkout] = useState<ActivityHistoryRecord | null>(null);

  const confirmDeleteBmiItem = (item: BmiHistoryRecord) => {
    Alert.alert(
      'Hapus Catatan',
      `Hapus riwayat BMI tanggal ${item.dateFormatted}?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => onDeleteBmiItem(item.id) },
      ]
    );
  };

  const confirmClearAllBmi = () => {
    Alert.alert(
      'Hapus Seluruh Riwayat BMI',
      'Apakah Anda yakin ingin menghapus semua catatan riwayat BMI tersimpan? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus Semua', style: 'destructive', onPress: onClearAllBmi },
      ]
    );
  };

  const confirmDeleteActivityItem = (item: ActivityHistoryRecord) => {
    Alert.alert(
      'Hapus Sesi Lari',
      `Hapus riwayat aktivitas jarak ${(item.distanceMeters / 1000).toFixed(2)} km?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: () => onDeleteActivityItem(item.id) },
      ]
    );
  };

  const confirmClearAllActivity = () => {
    Alert.alert(
      'Hapus Seluruh Sesi GPS',
      'Apakah Anda yakin ingin menghapus semua catatan riwayat GPS tersimpan?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus Semua', style: 'destructive', onPress: onClearAllActivity },
      ]
    );
  };

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}m ${secs}d`;
  };

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
              <View style={styles.historyIconBox}>
                <ClipboardList size={20} color="#3B82F6" />
              </View>
              <View>
                <Text style={styles.modalTitle}>Buku Riwayat &amp; Log Progres</Text>
                <Text style={styles.modalSubtitle}>Kinetic Pulse Biometric Archives</Text>
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

          {/* Dual Tabs: Riwayat BMI vs Riwayat GPS */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'bmi' && styles.tabBtnActive]}
              onPress={() => setActiveTab('bmi')}
              activeOpacity={0.8}
            >
              <Scale size={14} color={activeTab === 'bmi' ? '#3B82F6' : '#64748B'} />
              <Text
                style={[styles.tabBtnText, activeTab === 'bmi' && styles.tabBtnTextActive]}
              >
                Riwayat BMI ({bmiHistory.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'activity' && styles.tabBtnActive]}
              onPress={() => setActiveTab('activity')}
              activeOpacity={0.8}
            >
              <Activity size={14} color={activeTab === 'activity' ? '#3B82F6' : '#64748B'} />
              <Text
                style={[styles.tabBtnText, activeTab === 'activity' && styles.tabBtnTextActive]}
              >
                Riwayat GPS ({activityHistory.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: RIWAYAT BMI */}
          {activeTab === 'bmi' && (
            <>
              {bmiHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <ClipboardList size={32} color="#94A3B8" />
                  </View>
                  <Text style={styles.emptyTitle}>Belum Ada Riwayat BMI</Text>
                  <Text style={styles.emptySubtitle}>
                    Tekan tombol <Text style={{ fontWeight: '800', color: '#3B82F6' }}>"Simpan Riwayat BMI"</Text> di bawah kalkulator untuk mulai mendokumentasikan progres perubahan tubuh Anda.
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
                  {bmiHistory.map((item, idx) => (
                    <View key={item.id} style={styles.recordCard}>
                      {/* Top Bar Item */}
                      <View style={styles.recordHeader}>
                        <View style={styles.recordDateTime}>
                          <Calendar size={12} color="#64748B" />
                          <Text style={styles.recordDateText}>{item.dateFormatted}</Text>
                          <Clock size={11} color="#94A3B8" style={{ marginLeft: 4 }} />
                          <Text style={styles.recordTimeText}>{item.timeFormatted}</Text>
                        </View>

                        <View style={styles.recordBadgesGroup}>
                          <View style={styles.recordGenderBadge}>
                            <Text style={styles.recordGenderText}>
                              {item.gender === 'male' ? '♂ Pria' : '♀ Wanita'}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.recordCatBadge,
                              { backgroundColor: `${item.categoryColor}20` },
                            ]}
                          >
                            <Text
                              style={[
                                styles.recordCatBadgeText,
                                { color: item.categoryColor },
                              ]}
                            >
                              {item.categoryLabel}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Main Metrics Row */}
                      <View style={styles.recordMainRow}>
                        <View style={styles.recordBmiBox}>
                          <Text style={styles.recordBmiVal}>{item.bmi.toFixed(1)}</Text>
                          <Text style={styles.recordBmiLabel}>BMI INDEX</Text>
                        </View>

                        <View style={styles.recordDetailsCol}>
                          <Text style={styles.recordBodyStat}>
                            <Text style={{ fontWeight: '800', color: '#0F172A' }}>
                              {item.weightKg} kg
                            </Text>{' '}
                            • {item.heightCm} cm • {item.age} thn
                          </Text>
                          <Text style={styles.recordSubStat}>
                            Lemak: <Text style={{ fontWeight: '700' }}>{item.bodyFatPercentage}%</Text> ({item.bodyFatLabel})
                          </Text>
                          <Text style={styles.recordSubStat}>
                            BMR: {item.bmr} kkal • TDEE: {item.tdee} kkal
                          </Text>
                        </View>
                      </View>

                      {/* Card Bottom Actions */}
                      <View style={styles.recordActionsRow}>
                        <TouchableOpacity
                          style={styles.restoreBtn}
                          onPress={() => {
                            onRestoreBmiRecord(item);
                            onClose();
                          }}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.restoreBtnText}>Muat ke Kalkulator</Text>
                          <ArrowRight size={12} color="#2563EB" />
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => confirmDeleteBmiItem(item)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {/* Clear All BMI button */}
                  {bmiHistory.length > 1 && (
                    <TouchableOpacity
                      style={styles.clearAllBtn}
                      onPress={confirmClearAllBmi}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={13} color="#EF4444" />
                      <Text style={styles.clearAllBtnText}>Hapus Semua Riwayat BMI</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              )}
            </>
          )}

          {/* TAB 2: RIWAYAT AKTIVITAS GPS */}
          {activeTab === 'activity' && (
            <>
              {activityHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Activity size={32} color="#94A3B8" />
                  </View>
                  <Text style={styles.emptyTitle}>Belum Ada Riwayat Sesi GPS</Text>
                  <Text style={styles.emptySubtitle}>
                    Mulai pelacakan di bagian Pemantau Jarak Tempuh, lalu simpan aktivitas lari atau jalan santai Anda untuk melihat log riwayatnya di sini.
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.listScroll} showsVerticalScrollIndicator={false}>
                  {activityHistory.map((act) => (
                    <TouchableOpacity 
                      key={act.id} 
                      style={styles.recordCard} 
                      activeOpacity={0.7}
                      onPress={() => setSelectedWorkout(act)}
                    >
                      <View style={styles.recordHeader}>
                        <View style={styles.recordDateTime}>
                          <Calendar size={12} color="#64748B" />
                          <Text style={styles.recordDateText}>{act.dateFormatted}</Text>
                          <Clock size={11} color="#94A3B8" style={{ marginLeft: 4 }} />
                          <Text style={styles.recordTimeText}>{act.timeFormatted}</Text>
                        </View>

                        <TouchableOpacity
                          style={styles.deleteMiniBtn}
                          onPress={() => confirmDeleteActivityItem(act)}
                          activeOpacity={0.7}
                        >
                          <Trash2 size={13} color="#94A3B8" />
                        </TouchableOpacity>
                      </View>

                      {/* GPS Stats Grid */}
                      <View style={styles.actStatsGrid}>
                        <View style={styles.actStatBox}>
                          <MapPin size={14} color="#3B82F6" />
                          <Text style={styles.actStatVal}>
                            {act.distanceMeters < 1000
                              ? `${Math.round(act.distanceMeters)} m`
                              : `${(act.distanceMeters / 1000).toFixed(2)} km`}
                          </Text>
                          <Text style={styles.actStatLabel}>JARAK</Text>
                        </View>

                        <View style={styles.actStatBox}>
                          <Clock size={14} color="#60A5FA" />
                          <Text style={styles.actStatVal}>{formatDuration(act.durationSeconds)}</Text>
                          <Text style={styles.actStatLabel}>DURASI</Text>
                        </View>

                        <View style={styles.actStatBox}>
                          <Flame size={14} color="#F59E0B" />
                          <Text style={styles.actStatVal}>{act.caloriesBurned} kkal</Text>
                          <Text style={styles.actStatLabel}>KALORI</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}

                  {/* Clear All Activity button */}
                  {activityHistory.length > 1 && (
                    <TouchableOpacity
                      style={styles.clearAllBtn}
                      onPress={confirmClearAllActivity}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={13} color="#EF4444" />
                      <Text style={styles.clearAllBtnText}>Hapus Semua Riwayat GPS</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              )}
            </>
          )}

          {/* Footer Close Button */}
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>Tutup Buku Riwayat</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <WorkoutAnalysisModal 
        isOpen={!!selectedWorkout} 
        onClose={() => setSelectedWorkout(null)} 
        activity={selectedWorkout} 
      />
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
    maxHeight: '88%',
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
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  historyIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
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
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    gap: 4,
    marginBottom: 12,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  listScroll: {
    maxHeight: 380,
    marginVertical: 4,
  },
  recordCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordDateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordDateText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  recordTimeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  recordBadgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  recordGenderBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  recordGenderText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  recordCatBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  recordCatBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  recordMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  recordBmiBox: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 62,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recordBmiVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  recordBmiLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 1,
  },
  recordDetailsCol: {
    flex: 1,
  },
  recordBodyStat: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 2,
  },
  recordSubStat: {
    fontSize: 10.5,
    color: '#64748B',
    lineHeight: 14,
  },
  recordActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1, borderColor: '#3B82F6',
  },
  restoreBtnText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2563EB',
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  deleteMiniBtn: {
    padding: 4,
    borderRadius: 6,
  },
  actStatsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actStatBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actStatVal: {
    fontSize: 12.5,
    fontWeight: '900',
    color: '#0F172A',
    marginVertical: 2,
  },
  actStatLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 16,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  clearAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
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
