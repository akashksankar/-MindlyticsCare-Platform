import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ShieldCheck, Heart, BookOpen, ChevronRight, Check } from 'lucide-react';

interface OnboardingProps {
  displayName: string;
  onComplete: (hobbies: string[]) => void;
}

const HOBBY_OPTIONS = [
  { id: 'Reading', label: 'Reading 📚' },
  { id: 'Gaming', label: 'Gaming 🎮' },
  { id: 'Music', label: 'Music 🎵' },
  { id: 'Photography', label: 'Photography 📷' },
  { id: 'Painting', label: 'Painting 🎨' },
  { id: 'Cooking', label: 'Cooking 🍳' },
  { id: 'Travel', label: 'Travel ✈️' },
  { id: 'Writing', label: 'Writing ✍️' },
  { id: 'Fitness', label: 'Fitness 💪' },
  { id: 'Gardening', label: 'Gardening 🌱' },
  { id: 'Coding', label: 'Coding 💻' },
  { id: 'Movies', label: 'Movies 🎬' },
  { id: 'Anime', label: 'Anime 🌸' },
  { id: 'Nature', label: 'Nature 🌲' },
  { id: 'Drawing', label: 'Drawing ✏️' },
  { id: 'Chess', label: 'Chess ♟️' },
  { id: 'Pets', label: 'Pets 🐾' },
  { id: 'Sports', label: 'Sports ⚽' }
];

export default function Onboarding({ displayName, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [consent, setConsent] = useState(false);

  const toggleHobby = (id: string) => {
    if (selectedHobbies.includes(id)) {
      setSelectedHobbies(selectedHobbies.filter(h => h !== id));
    } else {
      setSelectedHobbies([...selectedHobbies, id]);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && consent) {
      setStep(2);
    } else if (step === 2) {
      onComplete(selectedHobbies);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Halos */}
      <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/10 blur-[120px] animate-pulse" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-500/10 blur-[120px] animate-pulse" />

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 relative z-10"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Heart className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Onboarding • Consent & Safety</span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight font-display">
              Welcome to MindlyticsCare, {displayName || 'Friend'}
            </h2>
            
            <p className="text-slate-400 text-sm mt-3 leading-relaxed">
              We are delighted to accompany you on your emotional resilience and habit growth journey.
              Before we begin, we want to share a few critical, patient-centric principles regarding privacy and clinical boundaries:
            </p>

            <div className="my-6 space-y-4 bg-slate-900/60 border border-white/10 p-5 rounded-2xl text-xs text-slate-300 leading-relaxed">
              <div className="flex gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-emerald-400">Non-Diagnostic Wellness Tool:</strong> MindlyticsCare is built for emotional reflection, pattern analysis, and wellness tracking. It does not diagnose mental illnesses, prescribe medication, or replace licensed medical professionals.
                </div>
              </div>
              <div className="flex gap-3">
                <BookOpen className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-emerald-400">Privacy & Consent:</strong> Your journals are fully secure. We never sell your personal narrative entries. They are parsed locally or in secure cloud instances to provide reflection summaries.
                </div>
              </div>
              <div className="flex gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <strong className="text-emerald-400">Crisis Protection:</strong> Our model scans entries for severe distress signals. If flagged, we provide immediate guidance to professional crisis hotlines.
                </div>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer select-none border border-white/5 hover:border-white/10 p-4 rounded-2xl bg-white/5 transition-all">
              <input
                type="checkbox"
                checked={consent}
                onChange={() => setConsent(!consent)}
                className="w-4 h-4 mt-0.5 accent-emerald-400 cursor-pointer rounded"
              />
              <span className="text-xs text-slate-400 leading-normal font-medium">
                I understand that MindlyticsCare is a wellness support and self-reflection application, and not a replacement for clinical psychiatric diagnosis or crisis services. I consent to my structured entries being securely analyzed by the reflection engine.
              </span>
            </label>

            <div className="mt-8 flex justify-end">
              <motion.button
                whileHover={consent ? { y: -2 } : {}}
                whileTap={consent ? { scale: 0.98 } : {}}
                onClick={handleNextStep}
                disabled={!consent}
                className={`py-3 px-6 rounded-2xl font-semibold flex items-center gap-2 transition-all cursor-pointer text-sm ${
                  consent
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/15'
                    : 'bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed'
                }`}
              >
                Continue Onboarding
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 relative z-10"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Onboarding • Personalization</span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight font-display">
              Select Your Creative Outlets & Hobbies
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Our AI reflection and book recommendation engines will offer specific, actionable wellness suggestions aligned with your actual interests. Choose as many as you like!
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-6 max-h-[300px] overflow-y-auto pr-1">
              {HOBBY_OPTIONS.map((h) => {
                const selected = selectedHobbies.includes(h.id);
                return (
                  <motion.button
                    key={h.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleHobby(h.id)}
                    type="button"
                    className={`py-3 px-4 rounded-2xl border text-left text-sm font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      selected
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/5'
                        : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <span>{h.label}</span>
                    {selected && (
                      <div className="p-0.5 rounded-full bg-emerald-500 text-slate-950">
                        <Check className="w-3 h-3 text-slate-950" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between items-center border-t border-white/10 pt-6">
              <button
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-300 text-sm font-semibold transition-colors cursor-pointer"
              >
                Back to Consent
              </button>
              
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNextStep}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold shadow-lg shadow-emerald-500/15 flex items-center gap-2 transition-all cursor-pointer text-sm"
              >
                Complete Onboarding
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
