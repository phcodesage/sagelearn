import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { CheckCircle, Lock, Play } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { lessonService } from '@/services/lessonService';
import { progressService } from '@/services/progressService';

interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  estimatedTime: number; // in minutes
}

export default function LessonsScreen() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<'javascript' | 'python' | 'php' | 'ruby'>('javascript');
  const params = useLocalSearchParams<{ lang?: 'javascript' | 'python' | 'php' | 'ruby' }>();

  // Initialize language from route params (e.g., onboarding selection)
  useEffect(() => {
    if (params?.lang && ['javascript','python','php','ruby'].includes(params.lang)) {
      setLanguage(params.lang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLoading(true);
    loadLessons();
  }, [language]);

  const loadLessons = async () => {
    try {
      // TODO: Replace with actual user ID from authentication
      const userId = 'demo-user';
      const allLessons = await lessonService.getAllLessons();
      const userProgress = await progressService.getUserProgress(userId);

      // Filter by selected language and sort by order
      const filtered = allLessons
        .filter((l: any) => l.language === language)
        .sort((a, b) => a.order - b.order);

      // Determine which lessons are unlocked and completed within this language track
      const lessonsWithStatus = filtered.map((lesson, index) => {
        const isCompleted = userProgress.some(p => p.lessonId === lesson.id && p.completed);
        const prevLesson = filtered[index - 1];
        const isUnlocked = index === 0 || (prevLesson && userProgress.some(p => p.lessonId === prevLesson.id && p.completed));

        return {
          ...lesson,
          isCompleted,
          isUnlocked: isUnlocked || index === 0,
        };
      });

      setLessons(lessonsWithStatus);
    } catch (error) {
      console.error('Failed to load lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonPress = (lesson: Lesson) => {
    if (!lesson.isUnlocked) return;
    
    router.push({
      pathname: '/lesson/[id]',
      params: { id: lesson.id }
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#10B981';
      case 'intermediate': return '#F59E0B';
      case 'advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lessons</Text>
          <Text style={styles.headerSubtitle}>Master coding step by step</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading lessons...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lessons</Text>
        <Text style={styles.headerSubtitle}>Master coding step by step</Text>
        <View style={styles.langRow}>
          {(['javascript','python','php','ruby'] as const).map(l => (
            <TouchableOpacity
              key={l}
              style={[styles.langPill, language === l && styles.langPillActive]}
              onPress={() => { setLanguage(l); }}
            >
              <Text style={[styles.langPillText, language === l && styles.langPillTextActive]}>
                {l === 'javascript' ? 'JavaScript' : l === 'python' ? 'Python' : l === 'php' ? 'PHP' : 'Ruby'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {lessons.map((lesson) => (
          <TouchableOpacity
            key={lesson.id}
            style={[
              styles.lessonCard,
              !lesson.isUnlocked && styles.lockedCard
            ]}
            onPress={() => handleLessonPress(lesson)}
            disabled={!lesson.isUnlocked}
          >
            <View style={styles.lessonHeader}>
              <View style={styles.lessonInfo}>
                <Text style={[styles.lessonTitle, !lesson.isUnlocked && styles.disabledText]}>
                  {lesson.title}
                </Text>
                <Text style={[styles.lessonDescription, !lesson.isUnlocked && styles.disabledText]}>
                  {lesson.description}
                </Text>
              </View>
              <View style={styles.lessonStatus}>
                {lesson.isCompleted ? (
                  <CheckCircle size={24} color="#10B981" />
                ) : lesson.isUnlocked ? (
                  <Play size={24} color="#3B82F6" />
                ) : (
                  <Lock size={24} color="#9CA3AF" />
                )}
              </View>
            </View>
            
            <View style={styles.lessonFooter}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(lesson.difficulty) + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(lesson.difficulty) }]}>
                  {lesson.difficulty}
                </Text>
              </View>
              <Text style={[styles.timeEstimate, !lesson.isUnlocked && styles.disabledText]}>
                {lesson.estimatedTime} min
              </Text>
            </View>
          </TouchableOpacity>
        ))}
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
  langRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  langPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
  },
  langPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  langPillText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  langPillTextActive: {
    color: '#4F46E5',
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
  lessonCard: {
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
  lockedCard: {
    backgroundColor: '#f9fafb',
    opacity: 0.7,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lessonInfo: {
    flex: 1,
    marginRight: 12,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  lessonStatus: {
    padding: 4,
  },
  lessonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  timeEstimate: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  disabledText: {
    color: '#9ca3af',
  },
});