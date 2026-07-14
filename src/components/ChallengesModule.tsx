import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Challenge21Day, UserProfile, ChallengeMission } from '../types';
import { 
  Sparkles, Award, Play, CheckCircle2, ChevronRight, BookOpen, 
  Smile, Flame, RefreshCw, Calendar, MessageSquare, AlertCircle 
} from 'lucide-react';

interface ChallengesModuleProps {
  userProfile: UserProfile;
  onSelectChallenge: (challengeId: string) => Promise<void>;
  onCompleteDay: (day: number) => Promise<void>;
  onResetChallenge: () => Promise<void>;
}

const PRESET_CHALLENGES: Challenge21Day[] = [
  {
    id: 'quit_procrastination',
    title: 'Focus Mastery & Procrastination Breakthrough',
    category: 'Productivity',
    description: 'Transform your deep focus and bypass avoidance behaviors in 21 days using progressive Pomodoro blocks and active goal chunking.',
    badgeName: 'Focus Champion 🏆',
    missions: [
      { day: 1, mission: 'Write down 3 tiny focus blocks and block them out with no notifications.', motivation: 'Every micro-step breaks avoidance patterns. Begin simple.', celebration: 'First barrier cleared! You proved you can begin.' },
      { day: 2, mission: 'Implement the 5-Minute Rule: work on one key task for exactly 5 minutes.', motivation: 'Action breeds motivation, not the other way around.', celebration: 'Amazing. Starting is 90% of the friction.' },
      { day: 3, mission: 'Declutter your workspace of all non-essential items before starting.', motivation: 'A clear sensory environment breeds high focus precision.', celebration: 'Your spatial clarity is now matched by mental focus.' },
      { day: 4, mission: 'Work on your hardest task first for 20 minutes (Eat that Frog).', motivation: 'Complete your most critical task before fatigue pools.', celebration: 'Outstanding. You conquered the heaviest friction early.' },
      { day: 5, mission: 'Reflect on what triggers avoidance (fear, fatigue, confusion?).', motivation: 'Conscious awareness is the key to decoupling avoidance cycles.', celebration: 'Insightful. Knowing your triggers is half the battle.' },
      { day: 6, mission: 'Do a 25-minute single-tasking session without clicking off.', motivation: 'Deep flow is built progressively like physical muscles.', celebration: 'Strong concentration. Muscle memories are forming.' },
      { day: 7, mission: 'Celebrate your 7-day progress by planning a restful tech-free evening.', motivation: 'True recovery maintains progressive long-term behavioral momentum.', celebration: 'First milestone! Week 1 focus mastery is complete.' },
      { day: 8, mission: 'Plan tomorrow\'s top priority today using exact time-blocks.', motivation: 'Eliminate morning decision fatigue to begin effortlessly.', celebration: 'Perfect execution. Tomorrow is already structured.' },
      { day: 9, mission: 'Do a Pomodoro loop: 25 mins work, 5 mins walk, 25 mins work.', motivation: 'Paced breaks sustain cognitive stamina and focus consistency.', celebration: 'Excellent. You sustained focus with healthy rest cycles.' },
      { day: 10, mission: 'Identify one digital distraction and isolate it (use website blockers).', motivation: 'Environment design is stronger than pure willpower.', celebration: 'Brilliant. You secured your focus sanctuary.' },
      { day: 11, mission: 'Work on a creative goal for 15 minutes without editing yourself.', motivation: 'Permit imperfect drafts; flow thrives on non-judgmental action.', celebration: 'Incredible. You chose creation over perfect avoidance.' },
      { day: 12, mission: 'Reflect on your motivation: Why does this transformation matter?', motivation: 'Reconnecting to core values fuels persistent focus.', celebration: 'Sincere reflection. Values-driven action is highly durable.' },
      { day: 13, mission: 'Say "no" to one minor non-urgent request to guard your deep focus window.', motivation: 'Saying no to others is saying yes to your core growth goals.', celebration: 'Courageous limit setting. Your focus is now guarded.' },
      { day: 14, mission: 'Celebrate a 14-day milestone by noting how your avoidance cycles have lessened.', motivation: 'Acknowledge your progress; positive reinforcement stabilizes behavior.', celebration: 'Milestone 2! You have successfully established focus stamina.' },
      { day: 15, mission: 'Do 30 minutes of deep focus, chunking the goals into 10-minute intervals.', motivation: 'Divide and conquer to bypass overwhelming tasks.', celebration: 'Fabulous. You made a mountain look like a molehill.' },
      { day: 16, mission: 'Complete a minor pending task that has been lingering for weeks.', motivation: 'Clear lingering cognitive debt to release latent mental energy.', celebration: 'Clean swipe! That lingering friction is gone.' },
      { day: 17, mission: 'Reflect on any self-talk when you feel like avoiding a task.', motivation: 'Gently counter "I will do it later" with "Let us try 3 minutes now".', celebration: 'Wise analysis. You decoupled automatic thought loops.' },
      { day: 18, mission: 'Do a 40-minute deep concentration flow block.', motivation: 'You have built high stamina. Trust your focusing capability.', celebration: 'Spectacular. You held deep flow for 40 full minutes.' },
      { day: 19, mission: 'Identify a protective buddy and tell them about your completed tasks.', motivation: 'Healthy social accountability anchors behavioral consistency.', celebration: 'Awesome. Shared victories multiply in value.' },
      { day: 20, mission: 'Design a personalized routine to trigger focus when you feel lazy.', motivation: 'Habit triggers automate entry into flow states.', celebration: 'Masterful. You designed a customized mental trigger.' },
      { day: 21, mission: 'Complete a 45-minute master focus session and claim your Transformation Badge!', motivation: 'The final summit. Reflect on how your focus agency has emerged.', celebration: 'Incredible! You completed the 21-day transformation and conquered procrastination!' }
    ]
  },
  {
    id: 'reduce_social_media',
    title: 'Digital Balance & Dopamine Detox',
    category: 'Mindfulness',
    description: 'Deconstruct automatic digital scrolls and repossess cognitive attention in 21 days with screen boundaries and creative grounding.',
    badgeName: 'Mindful Scroller 🧘',
    missions: [
      { day: 1, mission: 'Disable non-essential push notifications for your top social apps.', motivation: 'Regain authority over your attention; stop reacting to rings.', celebration: 'First step secured. Your screen is no longer commanding you.' },
      { day: 2, mission: 'Set a daily social media screen time limit of 45 minutes.', motivation: 'Limits establish creative space; less scrolling leads to more presence.', celebration: 'Superb. You reclaimed valuable minutes today.' },
      { day: 3, mission: 'Spend the first hour of your morning completely offline.', motivation: 'Protect your early morning cognitive state from external noise.', celebration: 'Brilliant. You started the day on your own terms.' },
      { day: 4, mission: 'Put your phone in another room while working or sleeping.', motivation: 'Distance reduces the default friction of automatic reaching.', celebration: 'Excellent. Physical distance is cognitive peace.' },
      { day: 5, mission: 'Replace 20 minutes of scrolling with active reading or writing.', motivation: 'Repurpose scroll time into conscious, creative inputs.', celebration: 'Inspiring. You fed your mind actual sustenance.' },
      { day: 6, mission: 'Reflect on what emotions trigger you to check your phone.', motivation: 'Scrolling is often a shield against boredom, anxiety, or fatigue.', celebration: 'Profound insight. Awareness decouples scroll impulses.' },
      { day: 7, mission: 'Keep your phone off during all meals today.', motivation: 'Savor nourishment and connect with your immediate surroundings.', celebration: 'Milestone 1! You enjoyed mindful presence while eating.' },
      { day: 8, mission: 'Take a 1-hour digital-free nature walk.', motivation: 'Exchange blue light and grids for organic, natural vistas.', celebration: 'Refreshing. Nature grounding has stabilized your energy.' },
      { day: 9, mission: 'Declutter your phone: delete unused apps and clean your home screen.', motivation: 'A clean digital landscape lowers passive visual anxiety.', celebration: 'Clean screen, clean mind. Minimalist device achieved.' },
      { day: 10, mission: 'Establish a phone-free charging dock outside your bedroom.', motivation: 'Your bed should remain a sanctuary for deep, natural recovery.', celebration: 'Perfect. Sleep hygiene has been elevated.' },
      { day: 11, mission: 'Spend an evening doing an active hobby without taking photos.', motivation: 'Live the experience for your presence, not for an audience.', celebration: 'Beautiful. You existed purely in the present moment.' },
      { day: 12, mission: 'Set your phone screen to Grayscale mode for the day.', motivation: 'Grayscale neutralizes the flashing colors that drive app loop retention.', celebration: 'Mindful hack. The phone suddenly feels boring.' },
      { day: 13, mission: 'Do a 24-hour social media fast today.', motivation: 'Reset your dopamine baseline; prove your capability to detach.', celebration: 'Astounding. You went a whole day scroll-free!' },
      { day: 14, mission: 'Celebrate 14 days by evaluating how your focus and calm have risen.', motivation: 'Progress tracking fuels long-term behavioral compliance.', celebration: 'Milestone 2! Reclaiming attention looks great on you.' },
      { day: 15, mission: 'Observe people in public without checking your phone.', motivation: 'Reconnect to the immediate social fabric of human life.', celebration: 'Fascinating. You chose curiosity over avoidance.' },
      { day: 16, mission: 'Identify 3 accounts that make you feel anxious and unfollow them.', motivation: 'Guard your mental inputs; curate a clean visual feed.', celebration: 'Curated. Your feeds are now supportive.' },
      { day: 17, mission: 'Create a list of 5 analog activities to do when bored.', motivation: 'Always have quick analog backups to avoid digital defaults.', celebration: 'Awesome. Your analog rescue pack is ready.' },
      { day: 18, mission: 'Engage in a deep analog conversation with no screens visible.', motivation: 'Physical presence is the purest form of attention.', celebration: 'Heartwarming. Connection is our ultimate protector.' },
      { day: 19, mission: 'Install a block on your phone between 9 PM and 7 AM.', motivation: 'Secure your evening wind-down cycles from cognitive noise.', celebration: 'Guarded. Your sleep window is protected.' },
      { day: 20, mission: 'Spend 15 minutes in silent meditation with no audio or guide.', motivation: 'Embrace silence; let your thoughts settle organically.', celebration: 'Sovereign peace. You can exist happily in stillness.' },
      { day: 21, mission: 'Reflect on your digital balance growth and claim your badge!', motivation: 'The final summit. Revisit your digital boundaries.', celebration: 'Congratulations! You established premium digital balance!' }
    ]
  }
];

export default function ChallengesModule({ userProfile, onSelectChallenge, onCompleteDay, onResetChallenge }: ChallengesModuleProps) {
  const [activeChallenge, setActiveChallenge] = useState<Challenge21Day | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile.challengeActiveId) {
      const match = PRESET_CHALLENGES.find(c => c.id === userProfile.challengeActiveId);
      if (match) {
        setActiveChallenge(match);
      }
    } else {
      setActiveChallenge(null);
    }
  }, [userProfile.challengeActiveId]);

  const handleStart = async (id: string) => {
    setLoading(true);
    try {
      await onSelectChallenge(id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCurrent = async () => {
    setLoading(true);
    try {
      await onCompleteDay(userProfile.challengeDay);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm("Would you like to restart this 21-Day Challenge? Your progress history will reset, providing an encouraging path to try again at your own pace.")) {
      setLoading(true);
      try {
        await onResetChallenge();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  // Calculate missing days or adaptive encouragement
  // If the user's lastActiveDate was multiple days ago, we provide a warm adaptive message.
  const [adaptiveMsg, setAdaptiveMsg] = useState<string | null>(null);
  useEffect(() => {
    if (userProfile.lastActiveDate && activeChallenge) {
      const lastActive = new Date(userProfile.lastActiveDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastActive.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 1) {
        setAdaptiveMsg(`Welcome back! We noticed you took a short break for a couple of days. That is completely okay and part of the natural growth curve. Life happens! Let's pick up exactly where you left off. No shame, just supportive restarts.`);
      } else {
        setAdaptiveMsg(null);
      }
    }
  }, [userProfile.lastActiveDate, activeChallenge]);

  // Current day's mission
  const currentDayIndex = userProfile.challengeDay - 1;
  const currentMission: ChallengeMission | undefined = activeChallenge?.missions[currentDayIndex];

  return (
    <div className="space-y-6">
      
      {!activeChallenge ? (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 text-white rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-xl" />
            <h3 className="text-xl font-bold tracking-tight mb-2 flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-400" />
              21-Day Behavior Transformation Challenge
            </h3>
            <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
              Launch a structured 21-day program built on cognitive behavioral models to anchor healthy habits, disrupt procrastination, and re-establish dopamine balance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PRESET_CHALLENGES.map(c => (
              <motion.div
                key={c.id}
                whileHover={{ y: -4 }}
                className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">{c.category}</span>
                    <span className="text-xs text-slate-450">21-Day Protocol</span>
                  </div>
                  <h4 className="font-bold text-white text-base">{c.title}</h4>
                  <p className="text-slate-400 text-xs leading-relaxed">{c.description}</p>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-400" />
                    Badge: {c.badgeName}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleStart(c.id)}
                    disabled={loading}
                    className="py-2 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-slate-950 stroke-slate-950 text-slate-950" />
                    Begin Protocol
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header for Active Challenge */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">Active Challenge</span>
                  <span className="text-xs text-slate-400 font-bold">Day {userProfile.challengeDay} of 21</span>
                </div>
                <h3 className="text-xl font-bold text-white">{activeChallenge.title}</h3>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="py-2 px-4 rounded-xl border border-white/10 text-slate-300 font-bold text-xs hover:bg-white/10 bg-white/5 transition-all cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Restart Program
                </button>
              </div>
            </div>

            {/* Progress line */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Transformation Progress</span>
                <span>{Math.round((userProfile.challengeDay / 21) * 100)}% Complete</span>
              </div>
              <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500" 
                  style={{ width: `${(userProfile.challengeDay / 21) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Adaptive encouragement banner */}
          {adaptiveMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-400/10 border border-emerald-500/20 text-slate-200 text-xs flex items-start gap-3"
            >
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5 text-emerald-400" />
              <span>{adaptiveMsg}</span>
            </motion.div>
          )}

          {/* Today\'s Mission Card */}
          {currentMission ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-white/5 border border-white/10 text-white rounded-3xl shadow-xl relative overflow-hidden"
            >
              {/* Halos */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl" />

              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Today's Mission (Day {userProfile.challengeDay})</span>
              </div>

              <h4 className="text-lg font-bold tracking-tight leading-snug mb-3 text-white">
                {currentMission.mission}
              </h4>

              <div className="p-4 bg-slate-950/45 border border-white/10 rounded-2xl mb-6 text-xs text-slate-300 leading-relaxed italic">
                💡 Motivation: "{currentMission.motivation}"
              </div>

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCompleteCurrent}
                  disabled={loading}
                  className="py-3 px-6 rounded-2xl bg-emerald-400 text-slate-950 font-bold text-sm shadow-md flex items-center gap-1.5 cursor-pointer disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  Mission Accomplished
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="p-8 text-center bg-white/5 border border-white/10 rounded-3xl shadow-xl">
              <Award className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-white">Challenge Completed!</h4>
              <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                Amazing work! You successfully navigated all 21 days of transformation and unlocked the "{activeChallenge.badgeName}" Badge! Keep utilizing these behaviors.
              </p>
              <button
                onClick={handleReset}
                className="mt-4 py-2 px-5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs cursor-pointer"
              >
                Restart Program
              </button>
            </div>
          )}

          {/* Timeline of Missions */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              21-Day Transformation Path
            </h4>

            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {activeChallenge.missions.map(m => {
                const dayFinished = m.day < userProfile.challengeDay;
                const isCurrent = m.day === userProfile.challengeDay;

                return (
                  <div
                    key={m.day}
                    className={`p-3 rounded-2xl border text-center space-y-1 ${
                      dayFinished 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : isCurrent
                          ? 'bg-white/15 border-white/20 text-white shadow-md'
                          : 'bg-slate-950/50 border-white/5 text-slate-500'
                    }`}
                  >
                    <div className="text-xs font-bold">Day {m.day}</div>
                    <div className="text-[9px] font-semibold uppercase">
                      {dayFinished ? '✓ Done' : isCurrent ? 'Active' : 'Locked'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
