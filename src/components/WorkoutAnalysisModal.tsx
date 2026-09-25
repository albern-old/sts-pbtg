import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  X,
  MapPin,
  Clock,
  Flame,
  Activity,
  Share,
  MoreHorizontal,
} from 'lucide-react-native';
import { ActivityHistoryRecord } from '../types';
import { ActivityMap } from './ActivityMap';
interface WorkoutAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityHistoryRecord | null;
}

export const WorkoutAnalysisModal: React.FC<WorkoutAnalysisModalProps> = ({
  isOpen,
  onClose,
  activity,
}) => {

  if (!activity) return null;

  const km = activity.distanceMeters / 1000;
  const durationMinutes = activity.durationSeconds / 60;
  const avgPaceMinutesPerKm = km > 0 ? durationMinutes / km : 0;
  
  const paceMins = Math.floor(avgPaceMinutesPerKm);
  const paceSecs = Math.round((avgPaceMinutesPerKm - paceMins) * 60);
  const avgPaceStr = `${paceMins}:${paceSecs.toString().padStart(2, '0')} /km`;

  const movingTimeStr = `${Math.floor(activity.durationSeconds / 60)}:${(activity.durationSeconds % 60).toString().padStart(2, '0')}`;

  return (
    <Modal visible={isOpen} transparent={false} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <X size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Run</Text>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn}>
              <Share size={20} color="#0F172A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerBtn}>
              <MoreHorizontal size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Map Section */}
          <View style={styles.mapContainer}>
            {activity.routeCoordinates && activity.routeCoordinates.length > 0 ? (
              <ActivityMap
                currentLocation={null} // Don't track current location
                routeCoordinates={activity.routeCoordinates}
                isTracking={false}
              />
            ) : (
              <View style={styles.noMapPlaceholder}>
                <MapPin size={32} color="#94A3B8" />
                <Text style={styles.noMapText}>No GPS route data saved for this run.</Text>
              </View>
            )}
          </View>

          {/* Detailed Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Avg Pace</Text>
              <Text style={styles.statValue}>{avgPaceStr}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Moving Time</Text>
              <Text style={styles.statValue}>{movingTimeStr}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{km.toFixed(2)} km</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Calories Burned</Text>
              <Text style={styles.statValue}>{activity.caloriesBurned} kkal</Text>
            </View>
          </View>

          {/* Workout Analysis Chart Placeholder */}
          <View style={styles.analysisSection}>
            <View style={styles.sectionHeader}>
              <Activity size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Workout Analysis</Text>
            </View>
            
            {/* Fake Chart representing pace consistency */}
            <View style={styles.chartContainer}>
              <View style={styles.chartYAxis}>
                <Text style={styles.chartAxisText}>9:00</Text>
                <Text style={styles.chartAxisText}>10:00</Text>
                <Text style={styles.chartAxisText}>11:00</Text>
                <Text style={styles.chartAxisText}>12:00</Text>
                <Text style={styles.chartAxisText}>/km</Text>
              </View>
              <View style={styles.chartBars}>
                {[0.6, 0.8, 0.9, 0.85, 0.8, 0.5].map((height, i) => (
                  <View key={i} style={styles.barWrapper}>
                    <View style={[styles.bar, { height: `${height * 100}%` }]} />
                  </View>
                ))}
                {/* Average line overlay */}
                <View style={styles.averageLine} />
              </View>
            </View>
          </View>

        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerBtn: {
    padding: 4,
  },
  scrollContent: {
    flex: 1,
  },
  mapContainer: {
    height: 350,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  noMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  noMapText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  statLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  analysisSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  chartContainer: {
    flexDirection: 'row',
    height: 180,
    marginTop: 10,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    paddingRight: 12,
    paddingVertical: 10,
  },
  chartAxisText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 10,
    position: 'relative',
  },
  barWrapper: {
    flex: 1,
    marginHorizontal: 4,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bar: {
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    width: '100%',
  },
  averageLine: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#0F172A',
    borderStyle: 'dashed',
    opacity: 0.5,
  }
});
