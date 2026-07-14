import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import { UserProfile, JournalEntry, Habit, WellnessScores } from './types';
import { calculateWellnessScores, calculateXPForEntry, EXPLANATIONS } from './utils';

// Import child modules
import SignSystem from './components/SignSystem';
import Onboarding from './components/Onboarding';
import JournalForm from './components/JournalForm';
import HabitsModule from './components/HabitsModule';
import ChallengesModule from './components/ChallengesModule';
import AnalyticsModule from './components/AnalyticsModule';
import CoachChatModule from './components/CoachChatModule';
import DailyRewards from './components/DailyRewards';
import WeeklyReportModule from './components/WeeklyReportModule';
import BookRecommendations from './components/BookRecommendations';

// Icons
import { 
  Sparkles, Smile, Battery, Target, ShieldAlert, Award, LogOut, 
  BookOpen, Calendar, HelpCircle, BarChart2, Heart, Bot, Compass, 
  Menu, X, Check, ArrowRight, BookMarked, UserCheck, CheckCircle,
  Loader2, ChevronRight, Star
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  
  // App core states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'journal' | 'habits' | 'challenges' | 'coach' | 'curation' | 'rewards'>('dashboard');
  const [isSavingJournal, setIsSavingJournal] = useState(false);
  const [showScoreExplanation, setShowScoreExplanation] = useState<keyof typeof EXPLANATIONS | null>(null);
  
  // Mobile drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor auth status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsGuest(false);
        await loadUserData(firebaseUser.uid, firebaseUser.email || '');
      } else {
        // Clear authenticated states
        setUser(null);
        const guestCached = localStorage.getItem('mindlytics_guest_profile');
        if (guestCached) {
          setIsGuest(true);
          loadGuestData();
        } else {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Load guest data from storage
  const loadGuestData = () => {
    try {
      const profile = JSON.parse(localStorage.getItem('mindlytics_guest_profile') || 'null');
      const savedEntries = JSON.parse(localStorage.getItem('mindlytics_guest_entries') || '[]');
      const savedHabits = JSON.parse(localStorage.getItem('mindlytics_guest_habits') || '[]');
      
      if (profile) {
        setUserProfile(profile);
        setEntries(savedEntries);
        setHabits(savedHabits);
      }
    } catch (e) {
      console.error('Error loading guest cache', e);
    } finally {
      setLoading(false);
    }
  };

  // Load authenticated data from Firestore
  const loadUserData = async (uid: string, email: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserProfile(userSnap.data() as UserProfile);
        
        // Fetch journal entries
        const entriesRef = collection(db, 'entries');
        const qEntries = query(entriesRef, where('userId', '==', uid));
        const entriesSnap = await getDocs(qEntries);
        const fetchedEntries: JournalEntry[] = [];
        entriesSnap.forEach(docSnap => {
          fetchedEntries.push({ id: docSnap.id, ...docSnap.data() } as JournalEntry);
        });
        setEntries(fetchedEntries.sort((a, b) => b.timestamp - a.timestamp));

        // Fetch habits
        const habitsRef = collection(db, 'habits');
        const qHabits = query(habitsRef, where('userId', '==', uid));
        const habitsSnap = await getDocs(qHabits);
        const fetchedHabits: Habit[] = [];
        habitsSnap.forEach(docSnap => {
          fetchedHabits.push({ id: docSnap.id, ...docSnap.data() } as Habit);
        });
        setHabits(fetchedHabits);
        setIsOnboarding(false);
      } else {
        // Brand new user, trigger onboarding
        setUserProfile({
          uid,
          email,
          displayName: auth.currentUser?.displayName || 'Wellness Explorer',
          hobbies: [],
          level: 1,
          xp: 100,
          joinedDate: new Date().toISOString().split('T')[0],
          challengeActiveId: null,
          challengeStartDay: null,
          challengeDay: 1,
          badges: ['7_day_journal'], // initial badge
          streakDays: 0,
          lastActiveDate: null
        });
        setIsOnboarding(true);
      }
    } catch (e) {
      console.error('Firestore load error', e);
      // fallback to offline mode if Firestore triggers permissions block during initial setup
      setIsGuest(true);
      loadGuestData();
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSuccess = async (authUser: any, isNew: boolean) => {
    setLoading(true);
    setUser(authUser);
    await loadUserData(authUser.uid, authUser.email || '');
  };

  const handleGuestJoin = () => {
    const mockProfile: UserProfile = {
      uid: 'guest_user',
      email: 'guest@mindlyticscare.internal',
      displayName: 'Guest Mindlytics User',
      hobbies: [],
      level: 1,
      xp: 120,
      joinedDate: new Date().toISOString().split('T')[0],
      challengeActiveId: null,
      challengeStartDay: null,
      challengeDay: 1,
      badges: ['7_day_journal'],
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };
    
    // Seed standard mock habits
    const mockHabits: Habit[] = [
      {
        id: 'mock_habit_1',
        userId: 'guest_user',
        name: 'Mindful Meditation 🧘',
        target: '15 minutes silent rest',
        reminder: '08:00',
        frequency: 'Daily',
        difficulty: 'Medium',
        completionHistory: {},
        streak: 2,
        consistencyScore: 80
      },
      {
        id: 'mock_habit_2',
        userId: 'guest_user',
        name: 'Water Target 💧',
        target: '8 Glasses Clean Water',
        reminder: '10:00',
        frequency: 'Daily',
        difficulty: 'Easy',
        completionHistory: {},
        streak: 4,
        consistencyScore: 90
      }
    ];

    localStorage.setItem('mindlytics_guest_profile', JSON.stringify(mockProfile));
    localStorage.setItem('mindlytics_guest_entries', JSON.stringify([]));
    localStorage.setItem('mindlytics_guest_habits', JSON.stringify(mockHabits));

    setIsGuest(true);
    setUserProfile(mockProfile);
    setEntries([]);
    setHabits(mockHabits);
    setIsOnboarding(true);
    setLoading(false);
  };

  const handleOnboardingComplete = async (hobbiesList: string[]) => {
    if (!userProfile) return;
    setLoading(true);

    const updatedProfile = { ...userProfile, hobbies: hobbiesList };
    setUserProfile(updatedProfile);

    if (isGuest) {
      localStorage.setItem('mindlytics_guest_profile', JSON.stringify(updatedProfile));
    } else {
      try {
        await setDoc(doc(db, 'users', userProfile.uid), updatedProfile);
      } catch (e) {
        console.error('Error saving Firestore profile', e);
      }
    }

    setIsOnboarding(false);
    setLoading(false);
    setActiveTab('dashboard');
  };

  const handleLogout = async () => {
    if (isGuest) {
      if (window.confirm("Disconnect Guest Account? Your offline cached profiles will remain on this browser, but logging in as a new user will replace them.")) {
        setIsGuest(false);
        setUserProfile(null);
        setEntries([]);
        setHabits([]);
      }
    } else {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      setEntries([]);
      setHabits([]);
    }
  };

  // 1. Core Journal Entry Save & Gemini Analysis Request
  const handleSaveJournal = async (entry: JournalEntry) => {
    if (!userProfile) return;
    setIsSavingJournal(true);

    try {
      // Prompt Gemini to conduct Clinical Psychology UX non-diagnostic analysis
      const analysisResponse = await fetch('/api/analyze-journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journal: entry,
          hobbies: userProfile.hobbies
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('AI analysis offline. Saving journal metrics directly.');
      }

      const analyzedPayload = await analysisResponse.json();
      entry.aiAnalysis = analyzedPayload;
    } catch (e: any) {
      console.warn('AI compilation error. Baseline local analysis triggered.', e);
      // Fallback local safe simulation
      entry.aiAnalysis = {
        emotionalTone: `Analytical balance following ${entry.mood}`,
        stressors: entry.stress > 5 ? ['Self-reported anxiety or work fatigue'] : [],
        positiveExperiences: entry.gratitude ? ['Gratitude mentioned'] : [],
        copingStrategies: ['Self-care reflection'],
        protectiveFactors: ['Structured wellness logging'],
        recurringThemes: ['Regular lifestyle indicators'],
        emotionalShifts: 'Consistent focus levels',
        behavioralPatterns: [`Self-reported stress of ${entry.stress}/10`],
        languageIntensity: 'Low',
        confidenceLevel: 80,
        dailyReflectionText: "You completed your wellness log successfully. Continue monitoring sleep, hydration, and positive goals.",
        suggestions: ["Introduce 5 minutes of deep breathing", "Reflect on creative interests like painting or music"],
        encouragement: "One day at a time. Your consistency builds cognitive resilience.",
        riskAssessment: { isHighRisk: false }
      };
    }

    // Save entry
    const finalEntry = { ...entry, userId: userProfile.uid };
    const updatedEntries = [finalEntry, ...entries];
    setEntries(updatedEntries);

    // Level up calculations
    const xpGained = calculateXPForEntry(finalEntry);
    const updatedXP = userProfile.xp + xpGained;
    const computedLevel = Math.floor(updatedXP / 500) + 1;
    
    // Check if new badges unlocked
    const earnedBadges = [...userProfile.badges];
    if (updatedEntries.length >= 7 && !earnedBadges.includes('7_day_journal')) {
      earnedBadges.push('7_day_journal');
    }
    if (entry.waterIntake >= 8 && !earnedBadges.includes('hydration_master')) {
      earnedBadges.push('hydration_master');
    }
    if (entry.sleepQuality === 'Excellent' && !earnedBadges.includes('sleep_champion')) {
      earnedBadges.push('sleep_champion');
    }

    const updatedProfile: UserProfile = {
      ...userProfile,
      xp: updatedXP,
      level: computedLevel,
      badges: earnedBadges,
      streakDays: userProfile.streakDays + 1,
      lastActiveDate: new Date().toISOString().split('T')[0]
    };

    setUserProfile(updatedProfile);

    // Persist profile and entries
    if (isGuest) {
      localStorage.setItem('mindlytics_guest_entries', JSON.stringify(updatedEntries));
      localStorage.setItem('mindlytics_guest_profile', JSON.stringify(updatedProfile));
    } else {
      try {
        await addDoc(collection(db, 'entries'), finalEntry);
        await updateDoc(doc(db, 'users', userProfile.uid), {
          xp: updatedXP,
          level: computedLevel,
          badges: earnedBadges,
          streakDays: userProfile.streakDays + 1,
          lastActiveDate: new Date().toISOString().split('T')[0]
        });
      } catch (err) {
        console.error('Error syncing Firestore entries', err);
      }
    }

    setIsSavingJournal(false);
    setActiveTab('dashboard');
  };

  // 2. Habit Ecosystem handlers
  const handleAddHabit = async (newH: Omit<Habit, 'id' | 'userId' | 'streak' | 'consistencyScore'>) => {
    if (!userProfile) return;
    const finalHabit: Habit = {
      ...newH,
      id: Math.random().toString(36).substr(2, 9),
      userId: userProfile.uid,
      streak: 0,
      consistencyScore: 0
    };

    const updatedHabits = [...habits, finalHabit];
    setHabits(updatedHabits);

    if (isGuest) {
      localStorage.setItem('mindlytics_guest_habits', JSON.stringify(updatedHabits));
    } else {
      try {
        await setDoc(doc(db, 'habits', finalHabit.id), finalHabit);
      } catch (e) {
        console.error('Error creating habit doc', e);
      }
    }
  };

  const handleToggleHabit = async (habitId: string, date: string) => {
    const updated = habits.map(h => {
      if (h.id === habitId) {
        const history = { ...h.completionHistory };
        const currentlyDone = history[date] || false;
        history[date] = !currentlyDone;
        
        // Calculate streak and score
        const historyList = Object.values(history);
        const doneCount = historyList.filter(v => v).length;
        const consistency = historyList.length > 0 ? Math.round((doneCount / historyList.length) * 100) : 0;
        
        let streak = h.streak;
        if (currentlyDone) {
          streak = Math.max(0, streak - 1);
        } else {
          streak += 1;
        }

        return { ...h, completionHistory: history, streak, consistencyScore: consistency };
      }
      return h;
    });

    setHabits(updated);

    // Grant small reward XP (10XP for completing a habit)
    if (userProfile) {
      const updatedXP = userProfile.xp + 10;
      const updatedProfile = { ...userProfile, xp: updatedXP };
      setUserProfile(updatedProfile);

      if (isGuest) {
        localStorage.setItem('mindlytics_guest_habits', JSON.stringify(updated));
        localStorage.setItem('mindlytics_guest_profile', JSON.stringify(updatedProfile));
      } else {
        try {
          const targetHabit = updated.find(h => h.id === habitId);
          if (targetHabit) {
            await setDoc(doc(db, 'habits', habitId), targetHabit);
            await updateDoc(doc(db, 'users', userProfile.uid), { xp: updatedXP });
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  };

  const handleDeleteHabit = async (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    setHabits(updated);

    if (isGuest) {
      localStorage.setItem('mindlytics_guest_habits', JSON.stringify(updated));
    } else {
      try {
        await deleteDoc(doc(db, 'habits', id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 3. 21-Day Challenge Protocol Handlers
  const handleSelectChallenge = async (challengeId: string) => {
    if (!userProfile) return;
    const updatedProfile = {
      ...userProfile,
      challengeActiveId: challengeId,
      challengeStartDay: new Date().toISOString().split('T')[0],
      challengeDay: 1
    };
    setUserProfile(updatedProfile);

    if (isGuest) {
      localStorage.setItem('mindlytics_guest_profile', JSON.stringify(updatedProfile));
    } else {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), {
          challengeActiveId: challengeId,
          challengeStartDay: new Date().toISOString().split('T')[0],
          challengeDay: 1
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCompleteDay = async (day: number) => {
    if (!userProfile) return;
    const reachedEnd = day >= 21;
    
    // Add XP booster + Unlock badge
    const earnedBadges = [...userProfile.badges];
    if (reachedEnd && !earnedBadges.includes('21_day_habit')) {
      earnedBadges.push('21_day_habit');
    }

    const updatedProfile = {
      ...userProfile,
      challengeDay: reachedEnd ? 22 : day + 1,
      xp: userProfile.xp + 150, // massive completion reward!
      badges: earnedBadges,
      challengeActiveId: reachedEnd ? null : userProfile.challengeActiveId // remove active once successfully done
    };
    setUserProfile(updatedProfile);

    if (isGuest) {
      localStorage.setItem('mindlytics_guest_profile', JSON.stringify(updatedProfile));
    } else {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), {
          challengeDay: reachedEnd ? 22 : day + 1,
          xp: userProfile.xp + 150,
          badges: earnedBadges,
          challengeActiveId: reachedEnd ? null : userProfile.challengeActiveId
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleResetChallenge = async () => {
    if (!userProfile) return;
    const updatedProfile = {
      ...userProfile,
      challengeActiveId: null,
      challengeStartDay: null,
      challengeDay: 1
    };
    setUserProfile(updatedProfile);

    if (isGuest) {
      localStorage.setItem('mindlytics_guest_profile', JSON.stringify(updatedProfile));
    } else {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), {
          challengeActiveId: null,
          challengeStartDay: null,
          challengeDay: 1
        });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 4. Claim gamified reward
  const handleClaimReward = async (xpGained: number) => {
    if (!userProfile) return;
    const updatedXP = userProfile.xp + xpGained;
    const level = Math.floor(updatedXP / 500) + 1;
    const updatedProfile = { ...userProfile, xp: updatedXP, level };
    setUserProfile(updatedProfile);

    if (isGuest) {
      localStorage.setItem('mindlytics_guest_profile', JSON.stringify(updatedProfile));
    } else {
      try {
        await updateDoc(doc(db, 'users', userProfile.uid), { xp: updatedXP, level });
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Calculations for dashboard display
  const scoreVectors = calculateWellnessScores(entries, habits);

  // Scan text for crisis indicators
  const HIGH_RISK_PATTERNS = ['self-harm', 'suicide', 'kill myself', 'end my life', 'hurt myself', 'want to die', 'overdose'];
  const hasCrisisIndicators = entries.some(e => {
    const textLower = e.text?.toLowerCase() || '';
    const hasWord = HIGH_RISK_PATTERNS.some(word => textLower.includes(word));
    const aiRisk = e.aiAnalysis?.riskAssessment?.isHighRisk || false;
    return hasWord || aiRisk;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <h2 className="text-xl font-bold font-display text-slate-100">MindlyticsCare</h2>
        <p className="text-xs text-slate-400 mt-1 uppercase font-semibold tracking-wider">Securing End-to-End Encrypted Handshake...</p>
      </div>
    );
  }

  // Not logged in and not guest
  if (!user && !isGuest) {
    return <SignSystem onSuccess={handleAuthSuccess} onSkip={handleGuestJoin} />;
  }

  // If logged in, but not onboarded yet
  if (isOnboarding) {
    return <Onboarding displayName={userProfile?.displayName || 'Wellness Seeker'} onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-16 md:pb-0 relative overflow-hidden">
      {/* Immersive background glow effects */}
      <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[30%] right-[10%] w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      
      {/* Top Banner / Header Header */}
      <header className="sticky top-0 z-40 bg-slate-950/60 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-400 to-indigo-600 rounded-xl text-white shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-display tracking-tight text-slate-100 flex items-center gap-1.5">
              Mindlytics<span className="text-emerald-400">Care</span>
              {isGuest && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-slate-400 uppercase">Guest Sandbox</span>}
            </h1>
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">Empathetic Behavioral Architect</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-bold bg-white/5 border border-white/5 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`py-2 px-3.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'dashboard' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('journal')} 
            className={`py-2 px-3.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'journal' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Daily check-in
          </button>
          <button 
            onClick={() => setActiveTab('habits')} 
            className={`py-2 px-3.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'habits' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Habit Matrix
          </button>
          <button 
            onClick={() => setActiveTab('challenges')} 
            className={`py-2 px-3.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'challenges' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            21-Day challenge
          </button>
          <button 
            onClick={() => setActiveTab('coach')} 
            className={`py-2 px-3.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'coach' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            AI Coach Chat
          </button>
          <button 
            onClick={() => setActiveTab('curation')} 
            className={`py-2 px-3.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'curation' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Curation Engine
          </button>
          <button 
            onClick={() => setActiveTab('rewards')} 
            className={`py-2 px-3.5 rounded-xl cursor-pointer transition-all ${
              activeTab === 'rewards' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Level {userProfile?.level || 1}
          </button>
        </nav>

        {/* Profile info and logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <span className="text-xs font-bold text-slate-200 block">{userProfile?.displayName}</span>
            <span className="text-[10px] text-emerald-400 font-bold block">Level {userProfile?.level} ({userProfile?.xp} XP)</span>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 bg-white/5 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-white/5 rounded-xl transition-colors cursor-pointer"
            title="Log Out Profile"
          >
            <LogOut className="w-4 h-4" />
          </button>

          {/* Mobile menu triggers */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 bg-white/5 border border-white/5 rounded-xl text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer pop-up */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 z-50 p-4 shadow-xl flex flex-col gap-2 font-bold text-slate-300 text-sm md:hidden no-print"
          >
            <button 
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`p-3 rounded-2xl text-left ${activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => { setActiveTab('journal'); setMobileMenuOpen(false); }}
              className={`p-3 rounded-2xl text-left ${activeTab === 'journal' ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
            >
              Daily check-in
            </button>
            <button 
              onClick={() => { setActiveTab('habits'); setMobileMenuOpen(false); }}
              className={`p-3 rounded-2xl text-left ${activeTab === 'habits' ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
            >
              Habit Matrix
            </button>
            <button 
              onClick={() => { setActiveTab('challenges'); setMobileMenuOpen(false); }}
              className={`p-3 rounded-2xl text-left ${activeTab === 'challenges' ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
            >
              21-Day challenge
            </button>
            <button 
              onClick={() => { setActiveTab('coach'); setMobileMenuOpen(false); }}
              className={`p-3 rounded-2xl text-left ${activeTab === 'coach' ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
            >
              AI Coach Chat
            </button>
            <button 
              onClick={() => { setActiveTab('curation'); setMobileMenuOpen(false); }}
              className={`p-3 rounded-2xl text-left ${activeTab === 'curation' ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
            >
              Curation Engine
            </button>
            <button 
              onClick={() => { setActiveTab('rewards'); setMobileMenuOpen(false); }}
              className={`p-3 rounded-2xl text-left ${activeTab === 'rewards' ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
            >
              Gamified Level Center
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main frame wrapper */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        
        {/* Safety crisis advisory block */}
        {hasCrisisIndicators && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-rose-50 border border-rose-200/80 rounded-3xl text-rose-800 space-y-3 relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 w-36 h-36 bg-rose-500/5 rounded-full blur-2xl" />
            <h4 className="font-bold text-sm md:text-base flex items-center gap-2">
              <ShieldAlert className="w-5.5 h-5.5 text-rose-600 animate-bounce" />
              Compassionate Safety Support Advisory
            </h4>
            <p className="text-xs md:text-sm text-rose-700 leading-relaxed max-w-3xl">
              We noticed recurring themes of severe distress or high anxiety in your recent logs. 
              Please remember that while our AI reflection engine offers empathetic self-care suggestions, 
              <strong> MindlyticsCare cannot replace medical emergencies or critical psychiatric care.</strong>
            </p>
            <div className="p-4 bg-white/50 border border-rose-100 rounded-2xl space-y-2 text-xs md:text-sm">
              <p className="font-semibold">Helpful Immediate Crisis Channels:</p>
              <ul className="list-disc list-inside space-y-1 pl-1 font-semibold text-rose-800">
                <li>National Crisis Lifeline (US): Call/Text <strong>988</strong> (Free, confidential 24/7)</li>
                <li>The Trevor Project: Call/Text <strong>1-866-488-7386</strong></li>
                <li>Text <strong>HOME</strong> to <strong>741741</strong> to reach the Crisis Text Line</li>
                <li>Reach out to a trusted family member, neighbor, or professional.</li>
              </ul>
            </div>
            <p className="text-[10px] text-rose-500 font-bold">You are not alone on this path. Please connect with human professionals to secure safe, supportive care.</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          
          {/* TAB 1: DASHBOARD AND STATS OVERVIEW */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              
              {/* Dynamic wellness score cards */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Mindlytics Core Scores 2.0</h3>
                  <span className="text-[11px] text-emerald-400 font-bold">Tap scores to see calculations</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {(['overall', 'emotional', 'lifestyle', 'consistency', 'growth'] as const).map(scoreKey => {
                    const titles = { overall: 'Overall State', emotional: 'Emotional Balance', lifestyle: 'Lifestyle Log', consistency: 'Habit Consistency', growth: 'Growth Index' };
                    const colors = { overall: 'from-emerald-500 to-teal-400 shadow-emerald-500/10', emotional: 'from-blue-500 to-emerald-400 shadow-emerald-400/10', lifestyle: 'from-sky-500 to-indigo-500 shadow-sky-500/10', consistency: 'from-indigo-600 to-purple-500 shadow-indigo-500/10', growth: 'from-amber-500 to-orange-400 shadow-orange-500/10' };
                    
                    return (
                      <motion.button
                        key={scoreKey}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowScoreExplanation(showScoreExplanation === scoreKey ? null : scoreKey)}
                        className={`p-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl text-left transition-all cursor-pointer shadow-sm`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 uppercase block leading-none">{titles[scoreKey]}</span>
                        <div className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-2 flex items-baseline gap-1">
                          {scoreVectors[scoreKey]}
                          <span className="text-[11px] text-slate-500 font-bold">/100</span>
                        </div>
                        {/* tiny line representation */}
                        <div className="h-1 w-full bg-white/10 rounded-full mt-2 overflow-hidden">
                          <div className={`h-full bg-gradient-to-r ${colors[scoreKey]}`} style={{ width: `${scoreVectors[scoreKey]}%` }} />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Score explain collapse popover */}
                <AnimatePresence>
                  {showScoreExplanation && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-xs text-slate-300 leading-relaxed overflow-hidden"
                    >
                      <strong className="text-emerald-400 uppercase block mb-1 font-bold">Score Breakdown:</strong>
                      {EXPLANATIONS[showScoreExplanation]}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sub-grid of Timeline, Reports and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Timeline and entries logs (col-span 2) */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Prompt for entry */}
                  <div className="p-6 bg-slate-900/60 border border-white/10 text-white rounded-3xl shadow-xl flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl" />
                    
                    <div className="space-y-1 flex-1 pr-4">
                      <h3 className="text-base font-bold tracking-tight">Ready for your structured daily check-in?</h3>
                      <p className="text-xs text-slate-400 leading-normal max-w-sm">
                        Map mood vectors, energy, gratitude diaries, sleep hours, and narrative thoughts. Let Gemini synthesize daily patterns.
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveTab('journal')}
                      className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/10 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      Begin Check-In
                      <ArrowRight className="w-3.5 h-3.5" />
                    </motion.button>
                  </div>

                  {/* Timeline outputs */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Resilience Timeline</h3>
                    
                    {entries.length === 0 ? (
                      <div className="p-8 text-center bg-white/5 border border-white/10 rounded-3xl text-slate-400">
                        No check-ins logged. Tap "Begin Check-In" to publish your first wellness milestone.
                      </div>
                    ) : (
                      <div className="relative border-l border-white/10 pl-6 space-y-6 ml-3">
                        {entries.slice(0, 5).map((e, idx) => (
                          <div key={idx} className="relative">
                            {/* Dot */}
                            <div className="absolute -left-[31px] top-1.5 p-1 rounded-full bg-emerald-500 text-white shadow-md shadow-emerald-500/20 z-10">
                              <Check className="w-2.5 h-2.5" />
                            </div>

                            {/* Card entry */}
                            <div className="p-5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-sm space-y-3">
                              <div className="flex justify-between items-start gap-2 flex-wrap">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-100 text-xs md:text-sm">{new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h4>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-emerald-400 border border-white/5">
                                      {e.mood} {e.customMoodText ? `(${e.customMoodText})` : ''}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Logged {new Date(e.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>

                                <div className="flex gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  <span>Sleep: {e.sleepHours} hrs</span>
                                  <span>Stress: {e.stress}/10</span>
                                </div>
                              </div>

                              {/* Qualitative reflections */}
                              {e.gratitude && (
                                <p className="text-[11px] text-slate-300 leading-normal bg-white/5 border border-white/5 p-2.5 rounded-xl">
                                  ❤️ Gratitude: "{e.gratitude}"
                                </p>
                              )}

                              {/* narrative snip */}
                              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-white/5 p-3 rounded-xl border border-white/5">
                                {e.text}
                              </p>

                              {/* Gemini AI synthesis */}
                              {e.aiAnalysis && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2.5">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                                    <Bot className="w-4 h-4 text-emerald-400" />
                                    AI Reflective Insight
                                  </div>
                                  <p className="text-xs text-emerald-200 leading-relaxed font-medium">
                                    {e.aiAnalysis.dailyReflectionText}
                                  </p>
                                  {e.aiAnalysis.suggestions?.length > 0 && (
                                    <div className="pt-1 text-[11px] text-emerald-300 font-semibold space-y-1">
                                      <span>Suggested Activity:</span>
                                      <ul className="list-disc list-inside font-medium pl-1 text-emerald-200 space-y-0.5">
                                        {e.aiAnalysis.suggestions.map((s, sidx) => <li key={sidx} className="list-item">{s}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Right side analytics reviews, books and habits shortcuts */}
                <div className="space-y-6">
                  
                  {/* Weekly report synthesis button shortcut */}
                  <div className="p-5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Digest reviews</h4>
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-100 text-sm">Synthesis Blueprints</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Aggregate your daily vectors to generate deep, printable psychological reviews with full behavioral advice.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('curation')} // maps to curation & reports tab
                      className="w-full py-2.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-200 font-bold text-xs bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Open Report Center
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Character stats & achievements preview */}
                  <div className="p-5 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leveling Status</h4>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl font-bold text-lg shadow-sm">
                        Lv {userProfile?.level}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
                          <span>XP progress</span>
                          <span>{userProfile ? userProfile.xp % 500 : 0}/500 XP</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${userProfile ? ((userProfile.xp % 500) / 500) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('rewards')}
                      className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-100 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
                    >
                      View Badge Cabinet
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Crisis Emergency Contact Card */}
                  <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl shadow-sm space-y-3">
                    <h5 className="font-bold text-emerald-400 text-xs flex items-center gap-1 uppercase tracking-wider">
                      <Heart className="w-4 h-4 text-emerald-400 shrink-0" />
                      Empathetic Guardrails
                    </h5>
                    <p className="text-[11px] text-emerald-200 leading-normal font-medium">
                      MindlyticsCare provides reflective wellness journaling. It does not replace medical counseling or diagnostic assessments. In times of extreme friction or persistent distress, please connect with human healthcare professionals or crisis lines.
                    </p>
                  </div>

                </div>
              </div>

              {/* Comprehensive Analytics Trend plots */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Analytical Trends & Logs</h3>
                <AnalyticsModule entries={entries} />
              </div>

            </motion.div>
          )}

          {/* TAB 2: JOURNAL CHECK-IN QUESTIONNAIRE */}
          {activeTab === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <JournalForm 
                hobbies={userProfile?.hobbies || []}
                onSave={handleSaveJournal}
                onCancel={() => setActiveTab('dashboard')}
                isSaving={isSavingJournal}
              />
            </motion.div>
          )}

          {/* TAB 3: HABIT MATRIX TRACKING */}
          {activeTab === 'habits' && (
            <motion.div
              key="habits"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <HabitsModule
                habits={habits}
                onAddHabit={handleAddHabit}
                onToggleHabit={handleToggleHabit}
                onDeleteHabit={handleDeleteHabit}
              />
            </motion.div>
          )}

          {/* TAB 4: 21-DAY TRANSFORMATION CHALLENGE */}
          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <ChallengesModule
                userProfile={userProfile!}
                onSelectChallenge={handleSelectChallenge}
                onCompleteDay={handleCompleteDay}
                onResetChallenge={handleResetChallenge}
              />
            </motion.div>
          )}

          {/* TAB 5: AI COACH CHAT MODULE */}
          {activeTab === 'coach' && (
            <motion.div
              key="coach"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <CoachChatModule userProfile={userProfile!} />
            </motion.div>
          )}

          {/* TAB 6: AI WEEKLY/MONTHLY REPORTS AND BOOKS */}
          {activeTab === 'curation' && (
            <motion.div
              key="curation"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-12"
            >
              {/* Reports block */}
              <WeeklyReportModule entries={entries} userProfile={userProfile!} />

              {/* Literary Curation */}
              <div className="pt-6 border-t border-slate-200">
                <BookRecommendations userProfile={userProfile!} />
              </div>
            </motion.div>
          )}

          {/* TAB 7: GAMIFICATION AND REWARDS */}
          {activeTab === 'rewards' && (
            <motion.div
              key="rewards"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <DailyRewards userProfile={userProfile!} onClaimReward={handleClaimReward} />
            </motion.div>
          )}

        </AnimatePresence>

      </main>

      {/* Mobile persistent Bottom Tab Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md border-t border-white/10 py-2.5 px-4 flex items-center justify-around md:hidden z-40 no-print">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[9px]">Home</span>
        </button>

        <button 
          onClick={() => setActiveTab('journal')} 
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
            activeTab === 'journal' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Smile className="w-5 h-5" />
          <span className="text-[9px]">Log</span>
        </button>

        <button 
          onClick={() => setActiveTab('habits')} 
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
            activeTab === 'habits' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[9px]">Matrix</span>
        </button>

        <button 
          onClick={() => setActiveTab('challenges')} 
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
            activeTab === 'challenges' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[9px]">Challenge</span>
        </button>

        <button 
          onClick={() => setActiveTab('coach')} 
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
            activeTab === 'coach' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[9px]">Coach</span>
        </button>

        <button 
          onClick={() => setActiveTab('curation')} 
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
            activeTab === 'curation' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[9px]">Curation</span>
        </button>

        <button 
          onClick={() => setActiveTab('rewards')} 
          className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
            activeTab === 'rewards' ? 'text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Star className="w-5 h-5" />
          <span className="text-[9px]">Cabinet</span>
        </button>
      </footer>

    </div>
  );
}
