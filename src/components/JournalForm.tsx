import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry, EmotionalState } from '../types';
import { 
  Sparkles, Smile, Battery, Zap, AlertTriangle, Target, BedDouble, 
  Users, Flame, Droplet, Monitor, Coffee, Heart, Trophy, BookOpen, 
  Mic, MicOff, Save, Loader2, CheckCircle, ChevronLeft, ChevronRight 
} from 'lucide-react';

interface JournalFormProps {
  hobbies: string[];
  onSave: (entry: JournalEntry) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const MOOD_OPTIONS: { id: EmotionalState; label: string; color: string }[] = [
  { id: 'Very Positive', label: 'Very Positive 😊', color: 'from-amber-400 to-emerald-400 shadow-emerald-400/20' },
  { id: 'Positive', label: 'Positive 🙂', color: 'from-emerald-400 to-teal-400 shadow-teal-400/20' },
  { id: 'Mostly Calm', label: 'Mostly Calm 😌', color: 'from-teal-400 to-sky-400 shadow-sky-400/20' },
  { id: 'Mixed', label: 'Mixed 😐', color: 'from-slate-400 to-amber-300 shadow-amber-300/20' },
  { id: 'Emotionally Drained', label: 'Emotionally Drained 🔋', color: 'from-blue-400 to-slate-500 shadow-slate-500/20' },
  { id: 'Stressed', label: 'Stressed 😫', color: 'from-orange-400 to-amber-500 shadow-amber-500/20' },
  { id: 'Anxious', label: 'Anxious 😰', color: 'from-indigo-400 to-purple-400 shadow-purple-400/20' },
  { id: 'Frustrated', label: 'Frustrated 😤', color: 'from-rose-400 to-orange-400 shadow-orange-400/20' },
  { id: 'Lonely', label: 'Lonely 🥺', color: 'from-indigo-500 to-slate-400 shadow-indigo-500/10' },
  { id: 'Overwhelmed', label: 'Overwhelmed 🤯', color: 'from-rose-500 to-red-400 shadow-rose-500/20' },
  { id: 'Custom', label: 'Custom 📝', color: 'from-teal-500 to-emerald-400 shadow-teal-500/20' }
];

const SOCIAL_INTERACTIONS = ['None', 'Family', 'Friends', 'Colleagues', 'Online', 'Meaningful Conversation'];
const PHYSICAL_ACTIVITIES = ['Walking', 'Gym', 'Running', 'Yoga', 'Sports', 'None'];

export default function JournalForm({ hobbies, onSave, onCancel, isSaving }: JournalFormProps) {
  const [step, setStep] = useState(1);
  const [mood, setMood] = useState<EmotionalState>('Mostly Calm');
  const [customMoodText, setCustomMoodText] = useState('');
  const [energy, setEnergy] = useState(7);
  const [motivation, setMotivation] = useState(7);
  const [stress, setStress] = useState(3);
  const [anxiety, setAnxiety] = useState(2);
  const [focus, setFocus] = useState(8);
  
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState<'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor'>('Good');
  const [socialInteraction, setSocialInteraction] = useState<string[]>(['Friends']);
  const [physicalActivity, setPhysicalActivity] = useState<string[]>(['Walking']);
  const [waterIntake, setWaterIntake] = useState(6);
  const [screenTime, setScreenTime] = useState(5);
  const [caffeineIntake, setCaffeineIntake] = useState(2);

  const [gratitude, setGratitude] = useState('');
  const [challengeToday, setChallengeToday] = useState('');
  const [achievementToday, setAchievementToday] = useState('');
  const [text, setText] = useState('');

  // Auto-saving indicators
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onresult = (event: any) => {
        const resultText = event.results[event.results.length - 1][0].transcript;
        setText(prev => prev + (prev ? ' ' : '') + resultText);
      };
      rec.onend = () => setIsListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice-to-text speech recognition is not fully supported in this browser. Please use Chrome/Safari.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Draft Autosave effect (runs every 15s when text changes)
  useEffect(() => {
    if (!text && !gratitude && !challengeToday && !achievementToday) return;
    
    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      const draft = {
        mood, customMoodText, energy, motivation, stress, anxiety, focus,
        sleepHours, sleepQuality, socialInteraction, physicalActivity,
        waterIntake, screenTime, caffeineIntake, gratitude, challengeToday,
        achievementToday, text
      };
      localStorage.setItem('mindlytics_journal_draft', JSON.stringify(draft));
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    }, 1500);

    return () => clearTimeout(timer);
  }, [
    text, gratitude, challengeToday, achievementToday, mood, customMoodText,
    energy, motivation, stress, anxiety, focus, sleepHours, sleepQuality,
    socialInteraction, physicalActivity, waterIntake, screenTime, caffeineIntake
  ]);

  // Load Draft on Mount
  useEffect(() => {
    const cached = localStorage.getItem('mindlytics_journal_draft');
    if (cached) {
      try {
        const draft = JSON.parse(cached);
        if (draft.mood) setMood(draft.mood);
        if (draft.customMoodText) setCustomMoodText(draft.customMoodText);
        if (draft.energy) setEnergy(draft.energy);
        if (draft.motivation) setMotivation(draft.motivation);
        if (draft.stress) setStress(draft.stress);
        if (draft.anxiety) setAnxiety(draft.anxiety);
        if (draft.focus) setFocus(draft.focus);
        if (draft.sleepHours) setSleepHours(draft.sleepHours);
        if (draft.sleepQuality) setSleepQuality(draft.sleepQuality);
        if (draft.socialInteraction) setSocialInteraction(draft.socialInteraction);
        if (draft.physicalActivity) setPhysicalActivity(draft.physicalActivity);
        if (draft.waterIntake) setWaterIntake(draft.waterIntake);
        if (draft.screenTime) setScreenTime(draft.screenTime);
        if (draft.caffeineIntake) setCaffeineIntake(draft.caffeineIntake);
        if (draft.gratitude) setGratitude(draft.gratitude);
        if (draft.challengeToday) setChallengeToday(draft.challengeToday);
        if (draft.achievementToday) setAchievementToday(draft.achievementToday);
        if (draft.text) setText(draft.text);
      } catch (e) {
        console.error('Error loading draft', e);
      }
    }
  }, []);

  const toggleSocial = (val: string) => {
    if (socialInteraction.includes(val)) {
      setSocialInteraction(socialInteraction.filter(item => item !== val));
    } else {
      setSocialInteraction([...socialInteraction, val]);
    }
  };

  const togglePhysical = (val: string) => {
    if (physicalActivity.includes(val)) {
      setPhysicalActivity(physicalActivity.filter(item => item !== val));
    } else {
      setPhysicalActivity([...physicalActivity, val]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entry: JournalEntry = {
      userId: '', // set in parent App
      date: new Date().toISOString().split('T')[0],
      mood,
      customMoodText: mood === 'Custom' ? customMoodText : undefined,
      energy,
      motivation,
      stress,
      anxiety,
      focus,
      sleepHours,
      sleepQuality,
      socialInteraction,
      physicalActivity,
      waterIntake,
      screenTime,
      caffeineIntake,
      gratitude,
      challengeToday,
      achievementToday,
      text,
      timestamp: Date.now()
    };
    await onSave(entry);
    localStorage.removeItem('mindlytics_journal_draft');
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-6 md:p-8 max-w-2xl mx-auto my-4 relative">
      
      {/* Top Save and Autosave Indicator */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          Structured Daily Reflection
        </h2>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          {autoSaveStatus === 'saving' && (
            <span className="flex items-center gap-1 text-emerald-400 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Autosaving...
            </span>
          )}
          {autoSaveStatus === 'saved' && (
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" />
              Draft saved
            </span>
          )}
          {autoSaveStatus === 'idle' && (
            <span className="flex items-center gap-1 text-slate-500">
              <Save className="w-3.5 h-3.5" />
              Autosave active
            </span>
          )}
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3, 4].map(idx => (
          <div 
            key={idx} 
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              step >= idx ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-white/5'
            }`}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Mood & Quantitative Scales */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2 mb-3">
                  <Smile className="w-4 h-4 text-emerald-400" />
                  How would you describe your overall emotional state today?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {MOOD_OPTIONS.map(m => {
                    const active = mood === m.id;
                    return (
                      <motion.button
                        key={m.id}
                        type="button"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMood(m.id)}
                        className={`p-3 rounded-2xl border text-xs font-semibold text-left flex items-center transition-all cursor-pointer ${
                          active 
                            ? `bg-gradient-to-tr ${m.color} text-white border-transparent shadow-lg` 
                            : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/20'
                        }`}
                      >
                        {m.label}
                      </motion.button>
                    );
                  })}
                </div>

                {mood === 'Custom' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <input
                      type="text"
                      required
                      placeholder="e.g. Melancholic yet grateful, Restless, Excited"
                      value={customMoodText}
                      onChange={(e) => setCustomMoodText(e.target.value)}
                      className="w-full p-3 rounded-2xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-400 text-sm text-white"
                    />
                  </motion.div>
                )}
              </div>

              {/* Slider metrics */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Daily Internal Vectors</h3>
                
                {/* Energy slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1">
                      <Battery className="w-4 h-4 text-emerald-400" />
                      Physical Energy ({energy}/10)
                    </span>
                    <span className="text-slate-450">{energy <= 4 ? 'Low' : energy <= 7 ? 'Balanced' : 'High Performance'}</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={energy} onChange={(e) => setEnergy(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Motivation slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Drive & Motivation ({motivation}/10)
                    </span>
                    <span className="text-slate-450">{motivation <= 4 ? 'Sluggish' : motivation <= 7 ? 'Steady' : 'Highly Driven'}</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={motivation} onChange={(e) => setMotivation(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Focus slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-300">
                    <span className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-sky-400" />
                      Focus & Concentration ({focus}/10)
                    </span>
                    <span className="text-slate-450">{focus <= 4 ? 'Distracted' : focus <= 7 ? 'Capable' : 'Deep Flow'}</span>
                  </div>
                  <input
                    type="range" min="1" max="10"
                    value={focus} onChange={(e) => setFocus(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Stress & Anxiety sliders (dual sliders of friction) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                        Stress Level ({stress}/10)
                      </span>
                    </div>
                    <input
                      type="range" min="1" max="10"
                      value={stress} onChange={(e) => setStress(parseInt(e.target.value))}
                      className="w-full accent-orange-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-300">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-purple-400" />
                        Anxiety Level ({anxiety}/10)
                      </span>
                    </div>
                    <input
                      type="range" min="1" max="10"
                      value={anxiety} onChange={(e) => setAnxiety(parseInt(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Physiological & Social Baselines */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Sleep track */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BedDouble className="w-4 h-4 text-emerald-400" />
                  Sleep Baseline
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Sleep Duration</label>
                    <input
                      type="number" step="0.5" min="0" max="24"
                      value={sleepHours} onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-slate-950 text-white font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-400 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Sleep Quality</label>
                    <select
                      value={sleepQuality} onChange={(e: any) => setSleepQuality(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-slate-950 text-white font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-400 text-sm"
                    >
                      <option className="bg-slate-950">Excellent</option>
                      <option className="bg-slate-950">Good</option>
                      <option className="bg-slate-950">Average</option>
                      <option className="bg-slate-950">Poor</option>
                      <option className="bg-slate-950">Very Poor</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Social Interactions */}
              <div>
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Social Interactions Today
                </label>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_INTERACTIONS.map(soc => {
                    const active = socialInteraction.includes(soc);
                    return (
                      <button
                        key={soc} type="button"
                        onClick={() => toggleSocial(soc)}
                        className={`py-2 px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          active
                            ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm shadow-emerald-500/10'
                            : 'bg-white/5 text-slate-300 border border-transparent hover:border-white/10'
                        }`}
                      >
                        {soc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Physical activities */}
              <div>
                <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  Physical Activity
                </label>
                <div className="flex flex-wrap gap-2">
                  {PHYSICAL_ACTIVITIES.map(phys => {
                    const active = physicalActivity.includes(phys);
                    return (
                      <button
                        key={phys} type="button"
                        onClick={() => togglePhysical(phys)}
                        className={`py-2 px-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          active
                            ? 'bg-emerald-400 text-slate-950 font-bold shadow-sm shadow-emerald-500/10'
                            : 'bg-white/5 text-slate-300 border border-transparent hover:border-white/10'
                        }`}
                      >
                        {phys}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle Counter Grid (Water, Screen, Caffeine) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-white/10">
                {/* Water Intake */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Water (Cups)</span>
                    <div className="text-xl font-bold text-white flex items-center gap-1">
                      <Droplet className="w-4 h-4 text-sky-400" />
                      {waterIntake}
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button" onClick={() => setWaterIntake(Math.max(0, waterIntake - 1))}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      type="button" onClick={() => setWaterIntake(waterIntake + 1)}
                      className="w-8 h-8 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center font-bold hover:bg-emerald-300 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Screen Time */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Screen Time</span>
                    <div className="text-xl font-bold text-white flex items-center gap-1">
                      <Monitor className="w-4 h-4 text-indigo-400" />
                      {screenTime} <span className="text-xs font-semibold text-slate-500">hrs</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button" onClick={() => setScreenTime(Math.max(0, screenTime - 1))}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      type="button" onClick={() => setScreenTime(screenTime + 1)}
                      className="w-8 h-8 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center font-bold hover:bg-emerald-300 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Caffeine Intake */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Caffeine</span>
                    <div className="text-xl font-bold text-white flex items-center gap-1">
                      <Coffee className="w-4 h-4 text-amber-500" />
                      {caffeineIntake} <span className="text-xs font-semibold text-slate-500">cups</span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button" onClick={() => setCaffeineIntake(Math.max(0, caffeineIntake - 1))}
                      className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-bold text-slate-300 hover:bg-white/10 cursor-pointer"
                    >
                      -
                    </button>
                    <button
                      type="button" onClick={() => setCaffeineIntake(caffeineIntake + 1)}
                      className="w-8 h-8 rounded-lg bg-emerald-400 text-slate-950 flex items-center justify-center font-bold hover:bg-emerald-300 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Qualitative Reflection (Gratitude & Milestones) */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Gratitude Reflection */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Heart className="w-4 h-5 text-rose-400 fill-rose-500/10" />
                  What is one thing you are grateful for today?
                </label>
                <textarea
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  placeholder="A supportive conversation, warm tea, completing a complex module..."
                  className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm text-white leading-relaxed min-h-[80px]"
                />
              </div>

              {/* Achievements today */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <Trophy className="w-4 h-5 text-amber-400" />
                  What was your biggest achievement or victory today?
                </label>
                <textarea
                  value={achievementToday}
                  onChange={(e) => setAchievementToday(e.target.value)}
                  placeholder="Completed all daily missions, navigated work triggers calmly..."
                  className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm text-white leading-relaxed min-h-[80px]"
                />
              </div>

              {/* Challenge today */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-5 text-indigo-400" />
                  What was your biggest challenge or friction point today?
                </label>
                <textarea
                  value={challengeToday}
                  onChange={(e) => setChallengeToday(e.target.value)}
                  placeholder="Felt distracted during deep focus, skipped meditation..."
                  className="w-full p-4 rounded-2xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm text-white leading-relaxed min-h-[80px]"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 4: Narrative Journal Editor */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
                  Narrative Journal (Supports Markdown)
                </label>
                
                {/* Voice to text trigger */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={toggleListening}
                  className={`py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                    isListening
                      ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20'
                      : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      Listening (Click to stop)
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      Voice-to-Text
                    </>
                  )}
                </motion.button>
              </div>

              <textarea
                value={text}
                required
                onChange={(e) => setText(e.target.value)}
                placeholder="Write your raw, honest narrative thoughts here. Describe events, stress events, breakthroughs, or things on your mind. The reflection engine uses this text to generate custom non-diagnostic summaries..."
                className="w-full p-4 rounded-3xl border border-white/10 bg-white/5 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-sm text-white leading-relaxed min-h-[220px]"
              />

              <div className="text-[10px] text-slate-400 font-semibold leading-relaxed p-3 bg-white/5 border border-white/10 rounded-xl">
                📝 Pro-tip: Supported Markdown highlights will be formatted beautifully. Speak clearly if using voice-to-text. Press "Complete & Request AI Insights" when finished.
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Form controls */}
        <div className="flex justify-between items-center border-t border-white/10 pt-6">
          <button
            type="button"
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            className="text-slate-400 hover:text-slate-200 font-bold text-sm transition-colors cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? 'Cancel' : 'Previous'}
          </button>

          {step < 4 ? (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setStep(step + 1)}
              className="py-2.5 px-5 rounded-2xl bg-white/10 text-white font-bold text-sm shadow-md flex items-center gap-1.5 transition-all cursor-pointer hover:bg-white/15"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSaving}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/15 flex items-center gap-2 transition-all cursor-pointer disabled:from-slate-850 disabled:to-slate-900 disabled:text-slate-500 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                  Consulting AI Engine...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-350" />
                  Complete & Request AI Insights
                </>
              )}
            </motion.button>
          )}
        </div>

      </form>
    </div>
  );
}
