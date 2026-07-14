import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Habit } from '../types';
import { 
  Sparkles, Flame, Plus, Calendar, Bell, ChevronRight, Check, Trash2, 
  Award, TrendingUp, RefreshCw, BarChart2, CheckCircle2 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface HabitsModuleProps {
  habits: Habit[];
  onAddHabit: (habit: Omit<Habit, 'id' | 'userId' | 'streak' | 'consistencyScore'>) => Promise<void>;
  onToggleHabit: (habitId: string, date: string) => Promise<void>;
  onDeleteHabit: (habitId: string) => Promise<void>;
}

const PRESET_HABITS = [
  { name: 'Meditation 🧘', target: '15 mins', reminder: '08:00', difficulty: 'Medium' as const },
  { name: 'Exercise 💪', target: '30 mins workout', reminder: '07:30', difficulty: 'Hard' as const },
  { name: 'Reading 📚', target: '10 pages', reminder: '21:00', difficulty: 'Easy' as const },
  { name: 'Walking 🚶', target: '8000 steps', reminder: '18:00', difficulty: 'Easy' as const },
  { name: 'Water Intake 💧', target: '8 glasses', reminder: '10:00', difficulty: 'Easy' as const },
  { name: 'Sleep before 11 PM 😴', target: '8 hrs rest', reminder: '22:30', difficulty: 'Hard' as const },
  { name: 'Digital Detox 📵', target: 'No social after 9 PM', reminder: '21:00', difficulty: 'Medium' as const },
  { name: 'No Sugar 🍎', target: 'Strict whole foods', reminder: '12:00', difficulty: 'Hard' as const }
];

export default function HabitsModule({ habits, onAddHabit, onToggleHabit, onDeleteHabit }: HabitsModuleProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [reminder, setReminder] = useState('08:00');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Custom'>('Daily');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const last7Days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(d.toISOString().split('T')[0]);
  }

  const handlePresetSelect = (preset: typeof PRESET_HABITS[0]) => {
    setName(preset.name);
    setTarget(preset.target);
    setReminder(preset.reminder);
    setDifficulty(preset.difficulty);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !target.trim()) return;

    setLoading(true);
    try {
      await onAddHabit({
        name,
        target,
        reminder,
        frequency,
        difficulty,
        completionHistory: {}
      });
      setName('');
      setTarget('');
      setReminder('08:00');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data for overall completions over last 7 days
  const chartData = last7Days.map(date => {
    const totalHabits = habits.length;
    const completedCount = habits.filter(h => h.completionHistory[date]).length;
    const pct = totalHabits > 0 ? Math.round((completedCount / totalHabits) * 100) : 0;
    
    // Format date string for label e.g., "Mon"
    const parsed = new Date(date + 'T12:00:00');
    const label = parsed.toLocaleDateString('en-US', { weekday: 'short' });

    return {
      date,
      day: label,
      Completions: completedCount,
      Percentage: pct
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Overview stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Active Habits</span>
            <div className="text-2xl font-bold text-white">{habits.length}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Best Streak</span>
            <div className="text-2xl font-bold text-white">
              {habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0), 0) : 0} <span className="text-xs font-semibold text-slate-450">days</span>
            </div>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-xl">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Consistency</span>
            <div className="text-2xl font-bold text-white">
              {habits.length > 0 
                ? Math.round(habits.reduce((acc, h) => acc + (h.consistencyScore || 0), 0) / habits.length) 
                : 0}%
            </div>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Primary Habits Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Your Habit Matrix
        </h3>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/15 flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-slate-950" />
          Create Custom Habit
        </motion.button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 bg-white/5 border border-white/10 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select a Quick Preset</h4>
              <div className="flex flex-wrap gap-2 pb-3 border-b border-white/5">
                {PRESET_HABITS.map(p => (
                  <button
                    key={p.name} type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 hover:border-emerald-400 text-xs font-semibold text-slate-300 hover:text-emerald-400 cursor-pointer transition-all"
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <form onSubmit={handleAddSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Habit Name</label>
                  <input
                    type="text" required placeholder="e.g. Diaphragmatic Breath"
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-white/10 bg-slate-950 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-sm text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Daily Target/Goal</label>
                  <input
                    type="text" required placeholder="e.g. 15 minutes twice a day"
                    value={target} onChange={(e) => setTarget(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-white/10 bg-slate-950 focus:outline-none focus:ring-1 focus:ring-emerald-400 text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 col-span-1 md:col-span-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Reminder Time</label>
                    <div className="relative">
                      <Bell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="time" required
                        value={reminder} onChange={(e) => setReminder(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-white/10 bg-slate-950 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Frequency</label>
                    <select
                      value={frequency} onChange={(e: any) => setFrequency(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-slate-950 text-xs text-white font-semibold"
                    >
                      <option className="bg-slate-950">Daily</option>
                      <option className="bg-slate-950">Weekly</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Difficulty</label>
                    <select
                      value={difficulty} onChange={(e: any) => setDifficulty(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-slate-950 text-xs text-white font-semibold"
                    >
                      <option className="bg-slate-950">Easy</option>
                      <option className="bg-slate-950">Medium</option>
                      <option className="bg-slate-950">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 col-span-1 md:col-span-2 pt-2">
                  <button
                    type="button" onClick={() => setShowAddForm(false)}
                    className="py-2 px-4 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={loading}
                    className="py-2.5 px-5 rounded-xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {loading && <RefreshCw className="w-3 animate-spin" />}
                    Add Habit
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit Lists */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl text-slate-400">
            No habits created yet. Select dynamic presets above to launch your cognitive habit ecosystem.
          </div>
        ) : (
          habits.map((h) => {
            const completedToday = h.completionHistory[todayStr] || false;
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{h.name}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      h.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      h.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {h.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      Goal: {h.target}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bell className="w-3.5 h-3.5 text-emerald-400" />
                      Reminds: {h.reminder}
                    </span>
                  </div>
                </div>

                {/* Grid of trailing 7 days completions */}
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="flex items-center gap-1 bg-white/5 p-1.5 rounded-xl border border-white/5">
                    {last7Days.map(date => {
                      const completed = h.completionHistory[date] || false;
                      const isToday = date === todayStr;
                      const parsed = new Date(date + 'T12:00:00');
                      const weekday = parsed.toLocaleDateString('en-US', { weekday: 'narrow' });

                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => onToggleHabit(h.id, date)}
                          title={`${date}: ${completed ? 'Completed' : 'Missed'}`}
                          className={`w-7 h-7 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center cursor-pointer transition-all ${
                            completed
                              ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 shadow-sm'
                              : isToday
                                ? 'bg-white/15 text-white hover:bg-white/20'
                                : 'bg-slate-950 border border-white/5 text-slate-500 hover:border-white/10'
                          }`}
                        >
                          <span>{weekday}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 border-l border-white/10 pl-4">
                    <div className="text-right">
                      <div className="text-xs font-bold text-white flex items-center gap-0.5 justify-end">
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        {h.streak || 0}
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Streak</span>
                    </div>

                    <button
                      onClick={() => onDeleteHabit(h.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Recharts Completion Analysis Graph */}
      {habits.length > 0 && (
        <div className="p-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            7-Day Completion Velocity
          </h4>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#e2e8f0' }}
                />
                <Bar dataKey="Percentage" fill="url(#colorCompletions)" radius={[4, 4, 0, 0]}>
                  <defs>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}
