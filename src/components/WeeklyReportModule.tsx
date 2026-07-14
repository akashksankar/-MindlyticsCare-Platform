import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { JournalEntry, UserProfile } from '../types';
import { Sparkles, Calendar, Award, RefreshCw, FileText, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';

interface WeeklyReportModuleProps {
  entries: JournalEntry[];
  userProfile: UserProfile;
}

export default function WeeklyReportModule({ entries, userProfile }: WeeklyReportModuleProps) {
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    
    // Filter entries based on range
    const now = Date.now();
    const daysLimit = reportType === 'weekly' ? 7 : 30;
    const filterMs = daysLimit * 24 * 60 * 60 * 1000;
    const filtered = entries.filter(e => (now - e.timestamp) <= filterMs);

    if (filtered.length === 0) {
      setError(`No journal entries logged within the past ${daysLimit} days. Please log a structured journal check-in to generate insights.`);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: filtered,
          type: reportType,
          userProfile
        })
      });

      if (!response.ok) {
        throw new Error('Curation server was unable to synthesize the logs.');
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Report generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Selector and explanation */}
      <div className="p-6 bg-white/5 border border-white/10 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 mb-1 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            Empathetic Psychological Reports
          </div>
          <h3 className="text-lg font-bold text-white">AI Weekly & Monthly Reports</h3>
          <p className="text-slate-400 text-xs max-w-md leading-relaxed">
            Synthesize all daily variables, screen timers, hydration, sleep cycles, and narrative themes. Generates clinical-UX reports with safe behavioral suggestions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* report type selector */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => { setReportType('weekly'); setReport(null); setError(null); }}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reportType === 'weekly' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-450 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => { setReportType('monthly'); setReport(null); setError(null); }}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                reportType === 'monthly' ? 'bg-white/15 text-white shadow-sm' : 'text-slate-450 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateReport}
            disabled={loading}
            className="py-2.5 px-5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer disabled:bg-white/5 disabled:text-slate-650"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Analyzing Logs...
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-slate-950" />
                Synthesize Report
              </>
            )}
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
          <Calendar className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Render synthesized reports */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-12 text-center bg-white/5 border border-white/10 rounded-3xl space-y-4"
          >
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <h4 className="font-bold text-white text-sm">Conducting Multi-Dimensional Sentiment Analysis</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Our AI engine is compiling journal keywords, stress vectors, sleep variables, and active streaks to compile a safe wellness blueprint...
            </p>
          </motion.div>
        ) : report ? (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 md:p-8 bg-white/5 border border-white/10 rounded-3xl shadow-xl space-y-6 printable-report"
          >
            {/* Report title */}
            <div className="flex justify-between items-start border-b border-white/10 pb-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">{reportType} Synthesis Blueprint</span>
                <h3 className="text-xl font-bold text-white">Empathetic Progress Review</h3>
                <span className="text-xs text-slate-400">Prepared for {userProfile.displayName || 'Wellness Seeker'} • Secure Cloud Curation</span>
              </div>

              <button
                onClick={handlePrint}
                className="py-1.5 px-3 border border-white/10 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-slate-300 flex items-center gap-1 cursor-pointer transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                Print/PDF
              </button>
            </div>

            {/* Content block grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Achievements & Habits */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-400" />
                    Achievements & Victories
                  </h4>
                  <ul className="space-y-2.5">
                    {report.achievements?.map((ach: string, i: number) => (
                      <li key={i} className="text-xs md:text-sm text-slate-200 flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    Positive Habits & Protective Behaviors
                  </h4>
                  <ul className="space-y-2.5">
                    {report.positiveHabits?.map((h: string, i: number) => (
                      <li key={i} className="text-xs md:text-sm text-slate-200 flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Stressors & Trends */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-450" />
                    Active Friction & Challenges
                  </h4>
                  <ul className="space-y-2.5">
                    {report.recurringChallenges?.map((ch: string, i: number) => (
                      <li key={i} className="text-xs md:text-sm text-slate-200 flex items-start gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
                        <ChevronRight className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                        <span>{ch}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Emotional Theme Stability
                  </h4>
                  <p className="text-xs md:text-sm text-slate-300 bg-white/5 border border-white/10 p-4 rounded-2xl leading-relaxed whitespace-pre-line">
                    {report.emotionalTrends}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom complete summaries */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="p-4 bg-slate-950/80 border border-white/10 text-white rounded-2xl space-y-1.5">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Behavioral & Correlation Insights
                </h4>
                <ul className="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
                  {report.behaviorInsights?.map((insight: string, i: number) => (
                    <li key={i} className="list-item pl-1">{insight}</li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Areas of Growth Focus</h4>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    {report.areasOfImprovement?.map((imp: string, i: number) => (
                      <li key={i} className="list-item">{imp}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-emerald-400/10 border border-emerald-500/20 rounded-2xl flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Empathetic Encouragement</h4>
                    <p className="text-xs text-slate-300 italic leading-relaxed font-semibold">
                      "{report.motivationalSummary}"
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mt-4">Psychological Resilience: {report.growthObservations}</span>
                </div>
              </div>
            </div>

          </motion.div>
        ) : null}
      </AnimatePresence>

    </div>
  );
}
