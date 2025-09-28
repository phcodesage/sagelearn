import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Animated, Easing } from 'react-native';
import { useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Play, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { lessonService } from '@/services/lessonService';
import { progressService } from '@/services/progressService';
import * as Haptics from 'expo-haptics';

interface LessonDetail {
  id: string;
  title: string;
  description: string;
  content: string;
  example: string;
  difficulty: string;
  estimatedTime: number;
  nextLessonId?: string;
}

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [canProceed, setCanProceed] = useState(false);
  const [contentHeights, setContentHeights] = useState({ height: 0, contentHeight: 1, y: 0 });
  const confetti = Array.from({ length: 18 }, () => new Animated.Value(0));

  useEffect(() => {
    if (id) {
      loadLesson(id);
    }
  }, [id]);

  const loadLesson = async (lessonId: string) => {
    try {
      const lessonData = await lessonService.getLessonById(lessonId);
      setLesson(lessonData);
      // Build short, focused pages from content and example
      if (lessonData) {
        const contentPages = lessonData.content
          .split(/\n\n+/)
          .map(s => s.trim())
          .filter(Boolean)
          .slice(0, 6); // cap to keep it concise
        const allPages = [...contentPages];
        if (lessonData.example) {
          allPages.push('Example'); // placeholder label for example page
        }
        setPages(allPages);
        // Restore last page if available
        const userId = 'demo-user';
        const state = await progressService.getLessonState(userId, lessonId);
        const startPage = Math.min(Math.max(state?.lastPage ?? 0, 0), allPages.length - 1);
        setCurrentPage(startPage);
        setQuizPassed(!!state?.quizPassed);
      }
      
      // Check if lesson is completed
      const userId = 'demo-user'; // TODO: Get from auth
      const progress = await progressService.getLessonProgress(userId, lessonId);
      setIsCompleted(progress?.completed || false);
    } catch (error) {
      console.error('Failed to load lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!lesson) return;
    
    try {
      const userId = 'demo-user'; // TODO: Get from auth
      await progressService.markLessonCompleted(userId, lesson.id);
      setIsCompleted(true);
      
      // TODO: Show completion celebration
      console.log('Lesson completed!');
    } catch (error) {
      console.error('Failed to mark lesson as completed:', error);
    }
  };

  const handlePractice = () => {
    // TODO: Navigate to practice screen for this lesson
    router.push('/practice');
  };

  const handleNext = () => {
    if (!lesson) return;
    const lastIndex = pages.length - 1;
    if (currentPage < lastIndex) {
      setCurrentPage(prev => prev + 1);
      return;
    }
    // At last page: require quiz first
    const userId = 'demo-user'; // TODO: Get from auth
    if (!quizPassed) {
      setShowQuiz(true);
      return;
    }
    if (!isCompleted) {
      progressService.markLessonCompleted(userId, lesson.id).then(async () => {
        setIsCompleted(true);
        setShowCongrats(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        startConfetti();
      }).catch(async () => {
        setShowCongrats(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        startConfetti();
      });
      return;
    }
    // Already completed: move to next lesson or exit
    if (lesson.nextLessonId) {
      router.replace(`/lesson/${lesson.nextLessonId}`);
    } else {
      router.back();
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  // Track scroll to require viewing full page
  const onScroll = (e: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const atBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 8;
    setCanProceed(atBottom);
  };

  // Persist last page on change
  useEffect(() => {
    const userId = 'demo-user';
    if (lesson?.id) {
      progressService.setLessonLastPage(userId, lesson.id, currentPage);
    }
    // Reset proceed gating when page changes
    setCanProceed(false);
  }, [currentPage, lesson?.id]);

  // Auto-advance to next lesson after a short delay when congrats is shown
  useEffect(() => {
    if (showCongrats) {
      const t = setTimeout(() => {
        if (lesson?.nextLessonId) {
          setShowCongrats(false);
          router.replace(`/lesson/${lesson.nextLessonId}`);
        }
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [showCongrats, lesson?.nextLessonId]);

  // Simple confetti animation
  const startConfetti = () => {
    confetti.forEach((val, i) => {
      val.setValue(0);
      Animated.timing(val, {
        toValue: 1,
        duration: 1200 + (i % 5) * 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading lesson...</Text>
        </View>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lesson not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{lesson.title}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Lesson Info (compact) */}
        <View style={styles.infoCard}>
          <View style={styles.lessonMeta}>
            <Text style={styles.difficulty}>{lesson.difficulty}</Text>
            <Text style={styles.estimatedTime}>{lesson.estimatedTime} min</Text>
          </View>
          <Text style={styles.description}>{lesson.description}</Text>
        </View>

        {/* Paged Content - one small chunk per screen */}
        <View style={styles.pageCard}>
          <Text style={styles.contentTitle}>
            {pages[currentPage] === 'Example' ? 'Example' : 'Lesson'}
          </Text>
          <ScrollView style={styles.pageScroll} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
            {pages[currentPage] === 'Example' && lesson.example ? (
              <View style={styles.codeBlock}>
                <Text style={styles.codeText}>{lesson.example}</Text>
              </View>
            ) : (
              <Text style={styles.contentText}>{pages[currentPage]}</Text>
            )}
          </ScrollView>
          {/* Pager controls */}
          <View style={styles.pagerBar}>
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentPage === 0}
              style={[styles.navButton, currentPage === 0 && styles.navButtonDisabled]}
            >
              <ChevronLeft size={16} color={currentPage === 0 ? '#9CA3AF' : '#3B82F6'} />
              <Text style={[styles.navButtonText, currentPage === 0 && styles.navButtonTextDisabled]}>Back</Text>
            </TouchableOpacity>
            <View style={styles.dots}>
              {pages.map((_, i) => (
                <View key={i} style={[styles.dot, i === currentPage && styles.dotActive]} />
              ))}
            </View>
            <TouchableOpacity
              onPress={handleNext}
              disabled={currentPage < pages.length - 1 ? !canProceed : !canProceed}
              style={[styles.navButton, styles.navButtonPrimary, (!canProceed) && styles.navButtonDisabled]}
            >
              <Text style={[styles.navButtonText, styles.navButtonTextPrimary]}>
                {currentPage === pages.length - 1 ? 'Finish' : 'Next'}
              </Text>
              <ChevronRight size={16} color={'#ffffff'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.practiceButton} onPress={handlePractice}>
            <Play size={20} color="#8B5CF6" />
            <Text style={styles.practiceButtonText}>Practice</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Celebration Modal with confetti */}
      <Modal visible={showCongrats} transparent animationType="fade" onRequestClose={() => setShowCongrats(false)}>
        <View style={styles.modalOverlay}>
          {/* Confetti pieces */}
          {confetti.map((val, i) => {
            const translateY = val.interpolate({ inputRange: [0, 1], outputRange: [-100, 200] });
            const translateX = ((i % 6) - 3) * 30 + (i * 3);
            const opacity = val.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0.2] });
            const bg = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#F43F5E'][i % 6];
            return (
              <Animated.View key={i} style={{ position: 'absolute', top: 0, left: '50%', transform: [{ translateX }, { translateY }], opacity }}>
                <View style={{ width: 8, height: 12, borderRadius: 2, backgroundColor: bg }} />
              </Animated.View>
            );
          })}
          <View style={styles.modalCard}>
            <CheckCircle size={48} color="#10B981" />
            <Text style={styles.modalTitle}>Great job!</Text>
            <Text style={styles.modalSubtitle}>You finished this lesson.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalSecondary} onPress={() => { setShowCongrats(false); handlePractice(); }}>
                <Text style={styles.modalSecondaryText}>Practice</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={() => {
                  setShowCongrats(false);
                  if (lesson?.nextLessonId) {
                    router.replace(`/lesson/${lesson.nextLessonId}`);
                  } else {
                    router.back();
                  }
                }}
              >
                <Text style={styles.modalPrimaryText}>{lesson?.nextLessonId ? 'Next Lesson' : 'Done'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Micro-quiz Modal */}
      <Modal visible={showQuiz} transparent animationType="fade" onRequestClose={() => setShowQuiz(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Quick Check</Text>
            <Text style={styles.modalSubtitle}>Is JavaScript the same as Java?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={async () => {
                  // Wrong
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  setShowQuiz(false);
                }}
              >
                <Text style={styles.modalSecondaryText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimary}
                onPress={async () => {
                  // Correct
                  const userId = 'demo-user';
                  if (lesson?.id) {
                    await progressService.setLessonQuizPassed(userId, lesson.id, true);
                  }
                  setQuizPassed(true);
                  setShowQuiz(false);
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
              >
                <Text style={styles.modalPrimaryText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 16,
  },
  backButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
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
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  difficulty: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    textTransform: 'capitalize',
  },
  estimatedTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  pageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    flex: 1,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  contentText: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
  },
  pageScroll: {
    flex: 1,
  },
  exampleCard: {
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
  exampleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  codeBlock: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    padding: 16,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  actions: {
    gap: 12,
    paddingBottom: 24,
  },
  pagerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    backgroundColor: '#8B5CF6',
    width: 16,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
  },
  navButtonDisabled: {
    opacity: 0.6,
  },
  navButtonPrimary: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  navButtonText: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  navButtonTextPrimary: {
    color: '#FFFFFF',
  },
  navButtonTextDisabled: {
    color: '#9CA3AF',
  },
  practiceButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  practiceButtonText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalPrimary: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalPrimaryText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  modalSecondary: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalSecondaryText: {
    color: '#4F46E5',
    fontWeight: '700',
  },
});