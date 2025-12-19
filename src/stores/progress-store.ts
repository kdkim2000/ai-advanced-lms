import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProgress, QuizResult, WrongAnswer, PracticeAttempt, QuizSession } from "@/types";

interface ProgressState {
  progress: UserProgress;

  // Actions
  markChapterComplete: (moduleId: string, chapterId: string) => void;
  markChapterIncomplete: (moduleId: string, chapterId: string) => void;
  addQuizResult: (moduleId: string, result: QuizResult) => void;
  toggleBookmark: (chapterId: string) => void;
  setNote: (chapterId: string, note: string) => void;
  setLastAccessed: (chapterId: string) => void;
  resetProgress: () => void;

  // Wrong Answers Actions
  addWrongAnswers: (wrongAnswers: WrongAnswer[]) => void;
  removeWrongAnswer: (id: string) => void;
  markWrongAnswerSolved: (id: string) => void;
  clearSolvedWrongAnswers: () => void;
  clearAllWrongAnswers: () => void;

  // Practice Attempts Actions
  addPracticeAttempt: (attempt: PracticeAttempt) => void;
  removePracticeAttempt: (id: string) => void;
  clearAllPracticeAttempts: () => void;

  // Quiz Session Actions
  saveQuizSession: (moduleId: string, session: QuizSession) => void;
  getQuizSession: (moduleId: string) => QuizSession | null;
  clearQuizSession: (moduleId: string) => void;
  hasQuizSession: (moduleId: string) => boolean;

  // Getters
  isChapterComplete: (moduleId: string, chapterId: string) => boolean;
  getModuleProgress: (moduleId: string) => number;
  getOverallProgress: (totalChapters: number) => number;
  isBookmarked: (chapterId: string) => boolean;
  getUnsolvedWrongAnswers: () => WrongAnswer[];
  getWrongAnswerCount: () => number;
  getPracticeAttempts: () => PracticeAttempt[];
  getPracticeStats: () => {
    totalAttempts: number;
    averageScore: number;
    bestScore: number;
    moduleAccuracy: { [moduleId: string]: { correct: number; total: number; title: string; icon: string } };
  };
}

const initialProgress: UserProgress = {
  moduleProgress: {},
  bookmarks: [],
  notes: {},
  wrongAnswers: [],
  practiceAttempts: [],
  quizSessions: {},
  updatedAt: new Date().toISOString(),
};

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: initialProgress,

      markChapterComplete: (moduleId, chapterId) => {
        set((state) => {
          const moduleProgress = state.progress.moduleProgress[moduleId] || {
            completedChapters: [],
            quizScores: [],
          };

          if (!moduleProgress.completedChapters.includes(chapterId)) {
            moduleProgress.completedChapters = [
              ...moduleProgress.completedChapters,
              chapterId,
            ];
          }

          return {
            progress: {
              ...state.progress,
              moduleProgress: {
                ...state.progress.moduleProgress,
                [moduleId]: moduleProgress,
              },
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      markChapterIncomplete: (moduleId, chapterId) => {
        set((state) => {
          const moduleProgress = state.progress.moduleProgress[moduleId];
          if (!moduleProgress) return state;

          return {
            progress: {
              ...state.progress,
              moduleProgress: {
                ...state.progress.moduleProgress,
                [moduleId]: {
                  ...moduleProgress,
                  completedChapters: moduleProgress.completedChapters.filter(
                    (id) => id !== chapterId
                  ),
                },
              },
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      addQuizResult: (moduleId, result) => {
        set((state) => {
          const moduleProgress = state.progress.moduleProgress[moduleId] || {
            completedChapters: [],
            quizScores: [],
          };

          return {
            progress: {
              ...state.progress,
              moduleProgress: {
                ...state.progress.moduleProgress,
                [moduleId]: {
                  ...moduleProgress,
                  quizScores: [...moduleProgress.quizScores, result],
                },
              },
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      toggleBookmark: (chapterId) => {
        set((state) => {
          const bookmarks = state.progress.bookmarks.includes(chapterId)
            ? state.progress.bookmarks.filter((id) => id !== chapterId)
            : [...state.progress.bookmarks, chapterId];

          return {
            progress: {
              ...state.progress,
              bookmarks,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      setNote: (chapterId, note) => {
        set((state) => ({
          progress: {
            ...state.progress,
            notes: {
              ...state.progress.notes,
              [chapterId]: note,
            },
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      setLastAccessed: (chapterId) => {
        set((state) => ({
          progress: {
            ...state.progress,
            lastAccessed: chapterId,
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      resetProgress: () => {
        set({ progress: initialProgress });
      },

      isChapterComplete: (moduleId, chapterId) => {
        const moduleProgress = get().progress.moduleProgress[moduleId];
        return moduleProgress?.completedChapters.includes(chapterId) ?? false;
      },

      getModuleProgress: (moduleId) => {
        const moduleProgress = get().progress.moduleProgress[moduleId];
        return moduleProgress?.completedChapters.length ?? 0;
      },

      getOverallProgress: (totalChapters) => {
        const { moduleProgress } = get().progress;
        const completedCount = Object.values(moduleProgress).reduce(
          (sum, mp) => sum + mp.completedChapters.length,
          0
        );
        return totalChapters > 0
          ? Math.round((completedCount / totalChapters) * 100)
          : 0;
      },

      isBookmarked: (chapterId) => {
        return get().progress.bookmarks.includes(chapterId);
      },

      // Wrong Answers implementations
      addWrongAnswers: (wrongAnswers) => {
        set((state) => {
          const existingIds = new Set(state.progress.wrongAnswers?.map(wa => wa.id) || []);
          // Filter out duplicates and already solved questions
          const newWrongAnswers = wrongAnswers.filter(wa => !existingIds.has(wa.id));

          return {
            progress: {
              ...state.progress,
              wrongAnswers: [...(state.progress.wrongAnswers || []), ...newWrongAnswers],
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      removeWrongAnswer: (id) => {
        set((state) => ({
          progress: {
            ...state.progress,
            wrongAnswers: (state.progress.wrongAnswers || []).filter(wa => wa.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      markWrongAnswerSolved: (id) => {
        set((state) => ({
          progress: {
            ...state.progress,
            wrongAnswers: (state.progress.wrongAnswers || []).map(wa =>
              wa.id === id ? { ...wa, solvedAt: new Date().toISOString() } : wa
            ),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      clearSolvedWrongAnswers: () => {
        set((state) => ({
          progress: {
            ...state.progress,
            wrongAnswers: (state.progress.wrongAnswers || []).filter(wa => !wa.solvedAt),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      clearAllWrongAnswers: () => {
        set((state) => ({
          progress: {
            ...state.progress,
            wrongAnswers: [],
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      getUnsolvedWrongAnswers: () => {
        return (get().progress.wrongAnswers || []).filter(wa => !wa.solvedAt);
      },

      getWrongAnswerCount: () => {
        return (get().progress.wrongAnswers || []).filter(wa => !wa.solvedAt).length;
      },

      // Practice Attempts implementations
      addPracticeAttempt: (attempt) => {
        set((state) => ({
          progress: {
            ...state.progress,
            practiceAttempts: [...(state.progress.practiceAttempts || []), attempt],
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      removePracticeAttempt: (id) => {
        set((state) => ({
          progress: {
            ...state.progress,
            practiceAttempts: (state.progress.practiceAttempts || []).filter(a => a.id !== id),
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      clearAllPracticeAttempts: () => {
        set((state) => ({
          progress: {
            ...state.progress,
            practiceAttempts: [],
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      // Quiz Session implementations
      saveQuizSession: (moduleId, session) => {
        set((state) => ({
          progress: {
            ...state.progress,
            quizSessions: {
              ...(state.progress.quizSessions || {}),
              [moduleId]: session,
            },
            updatedAt: new Date().toISOString(),
          },
        }));
      },

      getQuizSession: (moduleId) => {
        return get().progress.quizSessions?.[moduleId] || null;
      },

      clearQuizSession: (moduleId) => {
        set((state) => {
          const newSessions = { ...(state.progress.quizSessions || {}) };
          delete newSessions[moduleId];
          return {
            progress: {
              ...state.progress,
              quizSessions: newSessions,
              updatedAt: new Date().toISOString(),
            },
          };
        });
      },

      hasQuizSession: (moduleId) => {
        return !!get().progress.quizSessions?.[moduleId];
      },

      getPracticeAttempts: () => {
        return get().progress.practiceAttempts || [];
      },

      getPracticeStats: () => {
        const attempts = get().progress.practiceAttempts || [];

        if (attempts.length === 0) {
          return {
            totalAttempts: 0,
            averageScore: 0,
            bestScore: 0,
            moduleAccuracy: {},
          };
        }

        const totalAttempts = attempts.length;
        const averageScore = Math.round(
          attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts
        );
        const bestScore = Math.max(...attempts.map(a => a.percentage));

        // Aggregate module accuracy across all attempts
        const moduleAccuracy: { [moduleId: string]: { correct: number; total: number; title: string; icon: string } } = {};

        attempts.forEach(attempt => {
          Object.entries(attempt.moduleStats).forEach(([moduleId, stats]) => {
            if (!moduleAccuracy[moduleId]) {
              moduleAccuracy[moduleId] = {
                correct: 0,
                total: 0,
                title: stats.moduleTitle,
                icon: stats.moduleIcon,
              };
            }
            moduleAccuracy[moduleId].correct += stats.correct;
            moduleAccuracy[moduleId].total += stats.total;
          });
        });

        return {
          totalAttempts,
          averageScore,
          bestScore,
          moduleAccuracy,
        };
      },
    }),
    {
      name: "ai-advanced-lms-progress",
    }
  )
);
