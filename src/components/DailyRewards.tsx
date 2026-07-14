import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { Award, Flame, Check, Sparkles, Star, ChevronRight, Lock, Play } from 'lucide-react';

interface DailyRewardsProps {
  userProfile: UserProfile;
  onClaimReward: (xpGained: number) => Promise<void>;
}

const BADGES_DEFINITIONS = [
  { id: '7_day_journal', name: '7-Day Journaler 📝', desc: 'Log structured reflections for 7 consecutive days.', color: 'from-blue-400 to-indigo-500 shadow-indigo-500/20' },
  { id: '21_day_habit', name: '21-Day Transformer 🏆', desc: 'Successfully complete any 21-Day behavior challenge.', color: 'from-amber-400 to-orange-500 shadow-orange-500/20' },
  { id: '30_day_consistency', name: 'Consistency Master 🏔️', desc: 'Maintain habit and check-in consistency above 85% for 30 days.', color: 'from-purple-400 to-indigo-600 shadow-indigo-600/20' },
  { id: 'hydration_master', name: 'Hydration Champion 💧', desc: 'Hit your daily water target 5 days in a row.', color: 'from-sky-400 to-blue-500 shadow-blue-500/20' },
  { id: 'sleep_champion', name: 'Rest Champion 😴', desc: 'Report excellent sleep quality for 3 days.', color: 'from-teal-400 to-indigo-500 shadow-teal-500/20' },
  { id: 'mindfulness_explorer', name: 'Mindfulness Explorer 🧘', desc: 'Complete 10 supportive chat sessions with AI Coach.', color: 'from-emerald-400 to-teal-600 shadow-teal-600/20' },
  { id: 'growth_builder', name: 'Resilience Architect 🌱', desc: 'Reach Level 5 and log overall wellness score above 85.', color: 'from-teal-600 to-emerald-500 shadow-teal-600/20' }
];

export default function DailyRewards({ userProfile, onClaimReward }: DailyRewardsProps) {
  const [canClaim, setCanClaim] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Check if reward was already claimed today in local state
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const lastClaim = localStorage.getItem('mindlytics_last_claim_date');
    if (lastClaim === todayStr) {
      setCanClaim(false);
    } else {
      setCanClaim(true);
    }
  }, [userProfile.xp]);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await onClaimReward(50); // gain 50 XP
      localStorage.setItem('mindlytics_last_claim_date', todayStr);
      setCanClaim(false);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const currentLevel = Math.floor(userProfile.xp / 500) + 1;
  const xpInCurrentLevel = userProfile.xp % 500;
  const pctToNextLevel = Math.round((xpInCurrentLevel / 500) * 100);

  return (
    <div className="space-y-6">
      
      {/* Level and XP booster banner */}
      <div className="p-6 bg-gradient-to-tr from-indigo-600 via-emerald-500 to-teal-500 text-white rounded-3xl shadow-xl relative overflow-hidden">
        {/* Confetti celebration popup */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-20 flex flex-col items-center justify-center text-center p-4 border border-white/10"
            >
              <Star className="w-12 h-12 text-amber-350 animate-spin mb-2" />
              <h4 className="font-bold text-lg tracking-tight text-white">Daily Wellness Check-In Boosted!</h4>
              <p className="text-xs text-slate-350">+50 XP added to your resilience profile</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">Level {currentLevel} Architect</span>
              <span className="text-xs text-teal-100 font-bold">{userProfile.xp} Total XP</span>
            </div>
            
            <h3 className="text-xl font-bold tracking-tight">Your Behavioral Growth Journey</h3>
            
            {/* XP Bar */}
            <div className="space-y-1 pt-2 max-w-md">
              <div className="flex justify-between text-xs font-semibold text-teal-100">
                <span>XP Progress to Level {currentLevel + 1}</span>
                <span>{xpInCurrentLevel}/500 XP ({pctToNextLevel}%)</span>
              </div>
              <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-500" 
                  style={{ width: `${pctToNextLevel}%` }}
                />
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <motion.button
              whileHover={canClaim ? { scale: 1.05, y: -2 } : {}}
              whileTap={canClaim ? { scale: 0.95 } : {}}
              onClick={handleClaim}
              disabled={!canClaim || loading}
              className={`py-3 px-6 rounded-2xl font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
                canClaim
                  ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                  : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              {canClaim ? (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-900" />
                  Claim Daily Check-In Reward (+50 XP)
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Daily Boost Claimed Today
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Badges system */}
      <div className="space-y-3">
        <div className="space-y-0.5">
          <h4 className="font-bold text-white text-sm">Resilience Milestones & Achievements</h4>
          <p className="text-xs text-slate-400">Earn XP to level up your character and unlock certificates of wellness growth</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BADGES_DEFINITIONS.map(b => {
            const isUnlocked = userProfile.badges?.includes(b.id) || false;
            return (
              <motion.div
                key={b.id}
                whileHover={{ y: -2 }}
                className={`p-4 border rounded-3xl shadow-sm flex items-center gap-4 transition-all ${
                  isUnlocked 
                    ? 'bg-white/5 border-white/10' 
                    : 'bg-slate-900/40 border-white/5 opacity-50'
                }`}
              >
                <div className={`p-3 rounded-2xl bg-gradient-to-tr ${isUnlocked ? b.color : 'from-slate-800 to-slate-900 border border-white/5'} text-white shadow-md relative`}>
                  <Award className="w-5 h-5" />
                  {!isUnlocked && (
                    <div className="absolute -right-1 -bottom-1 p-0.5 rounded-full bg-slate-750 text-slate-450 border border-white/5">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <div className="space-y-0.5 flex-1">
                  <h5 className="font-bold text-slate-200 text-xs md:text-sm flex items-center justify-between">
                    <span>{b.name}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isUnlocked ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-950 text-slate-500'
                    }`}>
                      {isUnlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </h5>
                  <p className="text-[11px] text-slate-400 leading-snug">{b.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
