import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react-native';
import { progressService } from '@/services/progressService';

interface ProgressStats {
  lessonsCompleted: number;
  totalLessons: number;
  currentStreak: number;
  totalPracticeTime: number;
  averageScore: number;
  weeklyProgress: number[];
}

export default function ProgressScreen() {
  const [stats, setStats] = useState<ProgressStats>({
    lessonsCompleted: 0,
    totalLessons: 0,
    currentStreak: 0,
    totalPracticeTime: 0,
    averageScore: 0,
    weeklyProgress: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressStats();
  }, []);

  const loadProgressStats = async () => {
    try {
      // TODO: Replace with actual user ID from authentication
      const userId = 'demo-user';
      const progressStats = await progressService.getProgressStats(userId);
      setStats(progressStats);
    } catch (error) {
      console.error('Failed to load progress stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = () => {
    if (stats.totalLessons === 0) return 0;
    return Math.round((stats.lessonsCompleted / stats.totalLessons) * 100);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Progress</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading progress...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <Text style={styles.headerSubtitle}>Keep up the great work!</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Overall Progress</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {stats.lessonsCompleted} of {stats.totalLessons} lessons completed ({getProgressPercentage()}%)
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Trophy size={24} color="#F59E0B" />
            <Text style={styles.statNumber}>{stats.lessonsCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Target size={24} color="#EF4444" />
            <Text style={styles.statNumber}>{stats.currentStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          
          <View style={styles.statCard}>
            <Clock size={24} color="#8B5CF6" />
            <Text style={styles.statNumber}>{formatTime(stats.totalPracticeTime)}</Text>
            <Text style={styles.statLabel}>Practice Time</Text>
          </View>
          
          <View style={styles.statCard}>
            <TrendingUp size={24} color="#10B981" />
            <Text style={styles.statNumber}>{stats.averageScore}%</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
        </View>

        {/* Weekly Activity */}
        <View style={styles.activityCard}>
          <Text style={styles.cardTitle}>This Week</Text>
          <View style={styles.weeklyChart}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <View key={day} style={styles.dayColumn}>
                <View 
                  style={[
                    styles.activityBar,
                    { height: Math.max(4, (stats.weeklyProgress[index] || 0) * 40) }
                  ]} 
                />
                <Text style={styles.dayLabel}>{day}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.activityNote}>
            Practice sessions completed each day
          </Text>
        </View>

        {/* Achievements Section - TODO: Implement achievement system */}
        <View style={styles.achievementsCard}>
          <Text style={styles.cardTitle}>Recent Achievements</Text>
          <View style={styles.achievementsList}>
            <Text style={styles.comingSoon}>🏆 Achievements coming soon!</Text>
            <Text style={styles.comingSoonDesc}>
              Complete lessons and practice exercises to unlock badges and achievements.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  weeklyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 12,
  },
  dayColumn: {
    alignItems: 'center',
    flex: 1,
  },
  activityBar: {
    width: 20,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
    marginBottom: 8,
  },
  dayLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  activityNote: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  achievementsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementsList: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  comingSoon: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  comingSoonDesc: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
});