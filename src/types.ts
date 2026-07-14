export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  hobbies: string[];
  level: number;
  xp: number;
  joinedDate: string;
  challengeActiveId: string | null;
  challengeStartDay: string | null;
  challengeDay: number;
  badges: string[];
  streakDays: number;
  lastActiveDate: string | null;
}

export type EmotionalState =
  | 'Very Positive'
  | 'Positive'
  | 'Mostly Calm'
  | 'Mixed'
  | 'Emotionally Drained'
  | 'Stressed'
  | 'Anxious'
  | 'Frustrated'
  | 'Lonely'
  | 'Overwhelmed'
  | 'Custom';

export interface JournalEntry {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: EmotionalState;
  customMoodText?: string;
  energy: number; // 1-10
  motivation: number; // 1-10
  stress: number; // 1-10
  anxiety: number; // 1-10
  focus: number; // 1-10
  sleepHours: number;
  sleepQuality: 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor';
  socialInteraction: string[];
  physicalActivity: string[];
  waterIntake: number; // glasses or ml
  screenTime: number; // hours
  caffeineIntake: number; // cups
  gratitude: string;
  challengeToday: string;
  achievementToday: string;
  text: string;
  aiAnalysis?: AIAnalysis;
  timestamp: number;
}

export interface AIAnalysis {
  emotionalTone: string;
  stressors: string[];
  positiveExperiences: string[];
  copingStrategies: string[];
  protectiveFactors: string[];
  recurringThemes: string[];
  emotionalShifts: string;
  behavioralPatterns: string[];
  languageIntensity: 'Low' | 'Moderate' | 'High';
  confidenceLevel: number; // 0-100
  dailyReflectionText: string;
  weeklyReflectionText?: string;
  monthlyReflectionText?: string;
  suggestions: string[];
  encouragement: string;
  riskAssessment?: {
    isHighRisk: boolean;
    reason?: string;
  };
}

export interface Habit {
  id: string;
  userId: string;
  name: string;
  target: string;
  reminder: string; // e.g. "08:00"
  frequency: 'Daily' | 'Weekly' | 'Custom';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  completionHistory: { [date: string]: boolean }; // date key "YYYY-MM-DD" -> completed
  streak: number;
  consistencyScore: number; // % of completion
}

export interface ChallengeMission {
  day: number;
  mission: string;
  motivation: string;
  celebration: string;
}

export interface Challenge21Day {
  id: string;
  title: string;
  category: string;
  description: string;
  missions: ChallengeMission[];
  badgeName: string;
}

export interface BookRecommendation {
  title: string;
  author: string;
  genre: string;
  reason: string;
  difficulty: 'Easy' | 'Medium' | 'Insightful';
  readingTime: string;
  summary: string;
}

export interface WellnessScores {
  overall: number;
  emotional: number;
  lifestyle: number;
  consistency: number;
  growth: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}
