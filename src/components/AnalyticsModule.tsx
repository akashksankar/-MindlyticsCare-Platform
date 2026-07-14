import { JournalEntry } from '../types';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter
} from 'recharts';
import { 
  TrendingUp, Activity, Download, Printer, BookOpen, AlertCircle, 
  Smile, Moon, Droplet, Monitor, Award, Heart 
} from 'lucide-react';

interface AnalyticsModuleProps {
  entries: JournalEntry[];
}

export default function AnalyticsModule({ entries }: AnalyticsModuleProps) {

  if (entries.length === 0) {
    return (
      <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-3xl text-slate-400">
        <Activity className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-pulse" />
        <h4 className="font-bold text-white">Awaiting Log Metrics</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Complete your structured journal questionnaire to populate high-fidelity psychological trendlines and correlations.
        </p>
      </div>
    );
  }

  // Format data for Recharts
  const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);
  
  const chartData = sortedEntries.map(e => {
    const moodWeights: { [key: string]: number } = {
      'Very Positive': 10, 'Positive': 8.5, 'Mostly Calm': 8, 'Mixed': 6,
      'Emotionally Drained': 4, 'Stressed': 3.5, 'Anxious': 3, 'Frustrated': 2.5,
      'Lonely': 2, 'Overwhelmed': 1.5, 'Custom': 5
    };

    const formattedDate = new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });

    return {
      ...e,
      formattedDate,
      moodScore: moodWeights[e.mood] || 5,
      sleepHrs: e.sleepHours,
      stressLvl: e.stress,
      anxietyLvl: e.anxiety,
      energyLvl: e.energy,
      hydrationCups: e.waterIntake,
      screenHours: e.screenTime,
      exerciseDone: e.physicalActivity.includes('None') ? 0 : 1
    };
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "mindlytics_care_wellness_report.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 p-4 border border-white/10 rounded-2xl">
        <div className="space-y-0.5">
          <h4 className="font-bold text-white text-sm">Advanced Analytical Vectors</h4>
          <span className="text-xs text-slate-400">Real-time lifestyle tracking & correlations</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            className="py-2 px-4 rounded-xl border border-white/10 text-slate-350 font-bold text-xs bg-white/5 hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Data
          </button>
          <button
            onClick={handlePrint}
            className="py-2 px-4 rounded-xl bg-emerald-400 text-slate-950 font-bold text-xs hover:bg-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Grid of basic trend lines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood & Stress Timeline */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-emerald-400" />
            Mood Stability vs Stress Trend
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'semibold', color: '#94a3b8' }} />
                <Area type="monotone" name="Mood Score" dataKey="moodScore" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#moodGrad)" />
                <Area type="monotone" name="Stress Index" dataKey="stressLvl" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#stressGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy & Focus Timeline */}
        <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Daily Focus & Physical Energy
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} labelStyle={{ color: '#e2e8f0', fontWeight: 'bold' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'semibold', color: '#94a3b8' }} />
                <Line type="monotone" name="Focus Level" dataKey="focus" stroke="#a855f7" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" name="Energy Level" dataKey="energyLvl" stroke="#34d399" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Lifestyle Correlation Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Lifestyle Correlation Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Sleep Duration vs Mood Score */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-400" />
                Sleep Duration vs Mood Score
              </h4>
              <p className="text-[11px] text-slate-400">Identifies how raw sleeping hours correlates with daily happiness</p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                  <XAxis type="number" dataKey="sleepHrs" name="Sleep" unit=" hrs" stroke="#94a3b8" fontSize={10} />
                  <YAxis type="number" dataKey="moodScore" name="Mood" unit="/10" stroke="#94a3b8" fontSize={10} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Scatter name="Days" data={chartData} fill="#06b6d4" shape="circle" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Screen Time vs Stress Index */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-emerald-400" />
                Screen Exposure vs Stress Index
              </h4>
              <p className="text-[11px] text-slate-400">Analyzes if heavy screen fatigue triggers higher reported stress</p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                  <XAxis type="number" dataKey="screenHours" name="Screen Time" unit=" hrs" stroke="#94a3b8" fontSize={10} />
                  <YAxis type="number" dataKey="stressLvl" name="Stress" stroke="#94a3b8" fontSize={10} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Scatter name="Days" data={chartData} fill="#f43f5e" shape="circle" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Hydration vs Physical Energy */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-sky-400" />
                Hydration vs Energy Vectors
              </h4>
              <p className="text-[11px] text-slate-400">Validates physical stamina relative to daily water targets</p>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
                  <XAxis dataKey="formattedDate" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <Area type="monotone" name="Energy Level" dataKey="energyLvl" stroke="#10b981" fillOpacity={1} fill="url(#energyGrad)" />
                  <Line type="monotone" name="Water (Cups)" dataKey="hydrationCups" stroke="#06b6d4" strokeWidth={2} dot={{ r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Sleep Quality Distribution */}
          <div className="p-5 bg-white/5 border border-white/10 rounded-3xl space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Moon className="w-4 h-4 text-purple-400" />
              Sleep Quality Distribution
            </h4>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { quality: 'Excellent', count: chartData.filter(d => d.sleepQuality === 'Excellent').length },
                  { quality: 'Good', count: chartData.filter(d => d.sleepQuality === 'Good').length },
                  { quality: 'Average', count: chartData.filter(d => d.sleepQuality === 'Average').length },
                  { quality: 'Poor', count: chartData.filter(d => d.sleepQuality === 'Poor').length },
                  { quality: 'Very Poor', count: chartData.filter(d => d.sleepQuality === 'Very Poor').length },
                ]}>
                  <XAxis dataKey="quality" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} labelStyle={{ color: '#e2e8f0' }} />
                  <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
