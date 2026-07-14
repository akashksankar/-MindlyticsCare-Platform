import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookRecommendation, UserProfile } from '../types';
import { BookOpen, Sparkles, RefreshCw, Bookmark, Star, ArrowRight, Loader2 } from 'lucide-react';

interface BookRecommendationsProps {
  userProfile: UserProfile;
}

const CATEGORIES = [
  'Stress', 'Burnout', 'Motivation', 'Confidence', 'Self-esteem', 
  'Productivity', 'Mindfulness', 'Creativity', 'Grief', 'Anxiety management', 'Personal growth'
];

export default function BookRecommendations({ userProfile }: BookRecommendationsProps) {
  const [focus, setFocus] = useState('Stress');
  const [books, setBooks] = useState<BookRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/book-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ primaryFocus: focus, userProfile })
      });
      if (!response.ok) {
        throw new Error('Could not contact literary curation engine.');
      }
      const data = await response.json();
      setBooks(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Curation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search Header */}
      <div className="p-6 bg-white/5 border border-white/10 text-white rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl" />
        
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Mindlytics Curation</span>
        </div>
        
        <h3 className="text-lg font-bold tracking-tight mb-2 text-white">
          Personalized Literary Recommendation Engine
        </h3>
        <p className="text-slate-400 text-xs max-w-md leading-relaxed mb-6">
          Our literary curator identifies genuine, scientifically backed self-care and personal development texts matched directly to your current emotional focus and active hobbies.
        </p>

        {/* Categories grid */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Select Your Current Focus Area</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => {
              const active = focus === cat;
              return (
                <button
                  key={cat} type="button"
                  onClick={() => setFocus(cat)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    active
                      ? 'bg-emerald-400 text-slate-950 font-bold shadow-md'
                      : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchRecommendations}
            disabled={loading}
            className="py-2.5 px-5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:bg-slate-750 disabled:text-slate-500"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                Curation Active...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                Curate Book Selection
              </>
            )}
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
          {error}
        </div>
      )}

      {/* Recommendations Output Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AnimatePresence mode="wait">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-5 border border-white/10 bg-white/5 rounded-3xl space-y-4 animate-pulse">
                <div className="h-4 bg-white/5 rounded w-2/3" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-16 bg-white/5 rounded" />
                <div className="h-8 bg-white/5 rounded" />
              </div>
            ))
          ) : books.length === 0 ? (
            <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl text-slate-450 col-span-1 md:col-span-3 text-xs leading-relaxed font-semibold">
              No recommendations requested yet. Select your focus area and tap "Curate Book Selection".
            </div>
          ) : (
            books.map((b, idx) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="p-5 bg-white/5 border border-white/10 rounded-3xl shadow-xl flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">{b.genre}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-950 text-slate-400 border border-white/5">{b.difficulty}</span>
                  </div>

                  <h4 className="font-bold text-white text-sm leading-snug">{b.title}</h4>
                  <p className="text-[11px] font-bold text-slate-400 italic">By {b.author} • Reading: {b.readingTime}</p>
                  
                  <p className="text-slate-300 text-xs leading-relaxed pt-1">{b.summary}</p>
                </div>

                <div className="p-3 bg-slate-950/40 rounded-xl border border-white/5 text-[11px] text-slate-350 leading-normal flex gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Curation Reason:</strong> {b.reason}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
