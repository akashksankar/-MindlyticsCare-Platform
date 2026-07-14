import { JournalEntry, Habit, WellnessScores } from './types';

export function calculateWellnessScores(
  entries: JournalEntry[],
  habits: Habit[]
): WellnessScores {
  if (entries.length === 0) {
    return {
      overall: 70,
      emotional: 70,
      lifestyle: 70,
      consistency: 50,
      growth: 60,
    };
  }

  // Get recent entry
  const latestEntry = entries[entries.length - 1];

  // 1. Emotional Score (Mood, Anxiety, Stress)
  // Mood weights
  const moodWeights: { [key: string]: number } = {
    'Very Positive': 100,
    'Positive': 85,
    'Mostly Calm': 80,
    'Mixed': 60,
    'Emotionally Drained': 40,
    'Stressed': 35,
    'Anxious': 30,
    'Frustrated': 25,
    'Lonely': 20,
    'Overwhelmed': 15,
    'Custom': 50,
  };
  const moodScore = moodWeights[latestEntry.mood] || 50;
  const stressPenalty = (latestEntry.stress - 1) * 10; // Stress 1 is best (0 penalty), 10 is worst (90 penalty)
  const anxietyPenalty = (latestEntry.anxiety - 1) * 10;
  
  const emotionalBalance = Math.max(
    10,
    Math.min(100, Math.round(moodScore * 0.5 + (100 - stressPenalty) * 0.25 + (100 - anxietyPenalty) * 0.25))
  );

  // 2. Lifestyle Score (Sleep, Water, Screen Time, Caffeine, Activity)
  const sleepScore = Math.min(100, Math.round((latestEntry.sleepHours / 8) * 100));
  const waterScore = Math.min(100, Math.round((latestEntry.waterIntake / 8) * 100)); // 8 cups target
  const screenScore = Math.max(0, Math.min(100, 100 - latestEntry.screenTime * 10)); // lower screen time is better
  const caffeineScore = Math.max(0, Math.min(100, 100 - latestEntry.caffeineIntake * 15)); // limit caffeine
  const physicalScore = latestEntry.physicalActivity.length > 0 ? 100 : 30;
  
  const lifestyleScore = Math.round(
    sleepScore * 0.25 + waterScore * 0.2 + screenScore * 0.2 + caffeineScore * 0.15 + physicalScore * 0.2
  );

  // 3. Consistency Score (Habit completion % and Journaling consistency over last 7 days)
  let habitCompRate = 0;
  if (habits.length > 0) {
    const totalCompletions = habits.reduce((acc, h) => {
      const historyVals = Object.values(h.completionHistory);
      const completions = historyVals.filter(v => v).length;
      const rate = historyVals.length > 0 ? completions / historyVals.length : 0;
      return acc + rate;
    }, 0);
    habitCompRate = Math.round((totalCompletions / habits.length) * 100);
  } else {
    habitCompRate = 60; // baseline if no habits
  }

  // Journaling frequency over last 7 days
  const now = new Date();
  let entriesInLast7Days = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    if (entries.some(e => e.date === dateStr)) {
      entriesInLast7Days++;
    }
  }
  const journalConsistency = Math.round((entriesInLast7Days / 7) * 100);
  const consistencyScore = Math.round(habitCompRate * 0.5 + journalConsistency * 0.5);

  // 4. Growth Index (Motivation, Energy, Focus, plus gratitude journal entry present)
  const motivationVal = latestEntry.motivation * 10;
  const energyVal = latestEntry.energy * 10;
  const focusVal = latestEntry.focus * 10;
  const gratitudeBonus = latestEntry.gratitude ? 10 : 0;
  const achievementBonus = latestEntry.achievementToday ? 10 : 0;
  
  const growthIndex = Math.max(
    10,
    Math.min(100, Math.round((motivationVal + energyVal + focusVal) / 3 + gratitudeBonus + achievementBonus))
  );

  // 5. Overall Wellness Score (Weighted sum of emotional, lifestyle, consistency, growth)
  const overall = Math.round(
    emotionalBalance * 0.35 +
    lifestyleScore * 0.3 +
    consistencyScore * 0.15 +
    growthIndex * 0.2
  );

  return {
    overall: Math.min(100, Math.max(10, overall)),
    emotional: emotionalBalance,
    lifestyle: lifestyleScore,
    consistency: consistencyScore,
    growth: growthIndex,
  };
}

export function calculateXPForEntry(entry: JournalEntry): number {
  let xp = 100; // Base XP for journaling
  if (entry.text.length > 100) xp += 30; // length bonus
  if (entry.gratitude) xp += 10;
  if (entry.achievementToday) xp += 10;
  if (entry.physicalActivity.length > 0) xp += 15;
  return xp;
}

export const EXPLANATIONS = {
  overall: "Weighted synthesis representing your total state. Compiled from Emotional Balance (35%), Lifestyle Trackers (30%), Progressive Habits Consistency (15%), and Growth and Focus metrics (20%).",
  emotional: "Measures emotional resilience and self-reported calm. Calculated using your core mood vector minus anxiety and stress friction indexes.",
  lifestyle: "Calculated from core physiological baselines: deep sleep duration, clean hydration, healthy screen and caffeine intake, and physical movement logs.",
  consistency: "Reflects behavioral persistence. Derived from your active habit checklist completion rate combined with your daily journaling frequency over the trailing 7 days.",
  growth: "Calculated from focus concentration, internal motivation, high energy levels, and a qualitative mindfulness focus (gratitude and achievements tracking)."
};
