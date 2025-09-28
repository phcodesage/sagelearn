// Mock progress service - replace with actual Supabase integration
export interface UserProgress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  score?: number;
  completedAt?: Date;
  timeSpent: number; // in minutes
}

export interface ProgressStats {
  lessonsCompleted: number;
  totalLessons: number;
  currentStreak: number;
  totalPracticeTime: number;
  averageScore: number;
  weeklyProgress: number[];
}

export interface LessonState {
  userId: string;
  lessonId: string;
  lastPage: number;
  quizPassed?: boolean;
}

class ProgressService {
  // TODO: Replace with actual Supabase data
  private progressData: UserProgress[] = [
    {
      id: '1',
      userId: 'demo-user',
      lessonId: 'variables-basics',
      completed: true,
      score: 85,
      completedAt: new Date('2024-01-15'),
      timeSpent: 12
    }
  ];

  // Ephemeral per-lesson UI state (mock). Replace with DB persistence as needed.
  private lessonStates: LessonState[] = [];

  async getLessonState(userId: string, lessonId: string): Promise<LessonState | null> {
    return new Promise(resolve => {
      setTimeout(() => {
        const state = this.lessonStates.find(s => s.userId === userId && s.lessonId === lessonId) || null;
        resolve(state);
      }, 50);
    });
  }

  async setLessonLastPage(userId: string, lessonId: string, lastPage: number): Promise<LessonState> {
    return new Promise(resolve => {
      setTimeout(() => {
        const idx = this.lessonStates.findIndex(s => s.userId === userId && s.lessonId === lessonId);
        if (idx >= 0) {
          this.lessonStates[idx].lastPage = Math.max(0, lastPage);
          resolve(this.lessonStates[idx]);
        } else {
          const ns: LessonState = { userId, lessonId, lastPage: Math.max(0, lastPage) };
          this.lessonStates.push(ns);
          resolve(ns);
        }
      }, 50);
    });
  }

  async setLessonQuizPassed(userId: string, lessonId: string, passed: boolean): Promise<LessonState> {
    return new Promise(resolve => {
      setTimeout(() => {
        const idx = this.lessonStates.findIndex(s => s.userId === userId && s.lessonId === lessonId);
        if (idx >= 0) {
          this.lessonStates[idx].quizPassed = passed;
          resolve(this.lessonStates[idx]);
        } else {
          const ns: LessonState = { userId, lessonId, lastPage: 0, quizPassed: passed };
          this.lessonStates.push(ns);
          resolve(ns);
        }
      }, 50);
    });
  }

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    // TODO: Replace with Supabase query
    // const { data, error } = await supabase
    //   .from('user_progress')
    //   .select('*')
    //   .eq('user_id', userId);
    
    return new Promise(resolve => {
      setTimeout(() => {
        const userProgress = this.progressData.filter(p => p.userId === userId);
        resolve(userProgress);
      }, 100);
    });
  }

  async getLessonProgress(userId: string, lessonId: string): Promise<UserProgress | null> {
    // TODO: Replace with Supabase query
    // const { data, error } = await supabase
    //   .from('user_progress')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .eq('lesson_id', lessonId)
    //   .single();
    
    return new Promise(resolve => {
      setTimeout(() => {
        const progress = this.progressData.find(
          p => p.userId === userId && p.lessonId === lessonId
        );
        resolve(progress || null);
      }, 100);
    });
  }

  async markLessonCompleted(userId: string, lessonId: string, score?: number): Promise<UserProgress> {
    // TODO: Replace with Supabase upsert
    // const { data, error } = await supabase
    //   .from('user_progress')
    //   .upsert({
    //     user_id: userId,
    //     lesson_id: lessonId,
    //     completed: true,
    //     score: score,
    //     completed_at: new Date(),
    //   });
    
    return new Promise(resolve => {
      setTimeout(() => {
        const existingIndex = this.progressData.findIndex(
          p => p.userId === userId && p.lessonId === lessonId
        );
        
        const newProgress: UserProgress = {
          id: existingIndex >= 0 ? this.progressData[existingIndex].id : Math.random().toString(),
          userId,
          lessonId,
          completed: true,
          score,
          completedAt: new Date(),
          timeSpent: existingIndex >= 0 ? this.progressData[existingIndex].timeSpent : 0
        };

        if (existingIndex >= 0) {
          this.progressData[existingIndex] = newProgress;
        } else {
          this.progressData.push(newProgress);
        }

        resolve(newProgress);
      }, 100);
    });
  }

  async getProgressStats(userId: string): Promise<ProgressStats> {
    // TODO: Replace with Supabase aggregation queries
    return new Promise(resolve => {
      setTimeout(() => {
        const userProgress = this.progressData.filter(p => p.userId === userId);
        const completedLessons = userProgress.filter(p => p.completed);
        
        resolve({
          lessonsCompleted: completedLessons.length,
          totalLessons: 3, // TODO: Get actual total from lessons table
          currentStreak: 3, // TODO: Calculate actual streak
          totalPracticeTime: userProgress.reduce((total, p) => total + p.timeSpent, 0),
          averageScore: completedLessons.length > 0 
            ? Math.round(completedLessons.reduce((sum, p) => sum + (p.score || 0), 0) / completedLessons.length)
            : 0,
          weeklyProgress: [2, 1, 3, 0, 1, 2, 1] // TODO: Calculate actual weekly progress
        });
      }, 100);
    });
  }

  async updatePracticeTime(userId: string, lessonId: string, additionalTime: number): Promise<void> {
    // TODO: Replace with Supabase update
    // const { error } = await supabase
    //   .from('user_progress')
    //   .update({ 
    //     time_spent: supabase.raw('time_spent + ?', [additionalTime]) 
    //   })
    //   .eq('user_id', userId)
    //   .eq('lesson_id', lessonId);
    
    return new Promise(resolve => {
      setTimeout(() => {
        const progressIndex = this.progressData.findIndex(
          p => p.userId === userId && p.lessonId === lessonId
        );
        
        if (progressIndex >= 0) {
          this.progressData[progressIndex].timeSpent += additionalTime;
        }
        
        resolve();
      }, 100);
    });
  }
}

export const progressService = new ProgressService();