
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ExerciseCard } from './components/ExerciseCard';
import { StatsOverview } from './components/StatsOverview';
import { generateWeeklyPlan } from './geminiService';
import { DayPlan, WorkoutSession } from './types';
import { EXERCISE_LIBRARY } from './constants';

const Dashboard: React.FC = () => {
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [completedExercises, setCompletedExercises] = useState<Record<string, Set<string>>>({});

  // Persistence
  useEffect(() => {
    const savedPlan = localStorage.getItem('stride_strong_plan');
    const savedCompletions = localStorage.getItem('stride_strong_completions');
    
    if (savedPlan) {
      setPlan(JSON.parse(savedPlan));
      setLoading(false);
    } else {
      initPlan();
    }

    if (savedCompletions) {
      const parsed = JSON.parse(savedCompletions);
      const restored: Record<string, Set<string>> = {};
      Object.keys(parsed).forEach(date => {
        restored[date] = new Set(parsed[date]);
      });
      setCompletedExercises(restored);
    }
  }, []);

  const initPlan = async () => {
    setLoading(true);
    const newPlan = await generateWeeklyPlan("Increase running pace, avoid hip and glute injuries.");
    setPlan(newPlan);
    localStorage.setItem('stride_strong_plan', JSON.stringify(newPlan));
    setLoading(false);
  };

  const currentDayPlan = useMemo(() => {
    return plan.find(d => d.date.split('T')[0] === selectedDate);
  }, [plan, selectedDate]);

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => {
      const dateSet = new Set(prev[selectedDate] || []);
      if (dateSet.has(exerciseId)) dateSet.delete(exerciseId);
      else dateSet.add(exerciseId);
      
      const next = { ...prev, [selectedDate]: dateSet };
      // Save to localStorage (mapping Sets to Arrays)
      const toSave: Record<string, string[]> = {};
      Object.keys(next).forEach(date => {
        toSave[date] = Array.from(next[date]);
      });
      localStorage.setItem('stride_strong_completions', JSON.stringify(toSave));
      return next;
    });
  };

  const isDayFullyComplete = useMemo(() => {
    if (!currentDayPlan || currentDayPlan.type === 'rest') return false;
    if (currentDayPlan.type === 'running') return (completedExercises[selectedDate]?.size || 0) > 0;
    const sessionExs = currentDayPlan.session?.exercises || [];
    return sessionExs.length > 0 && sessionExs.every(e => completedExercises[selectedDate]?.has(e.id));
  }, [currentDayPlan, completedExercises, selectedDate]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
      day: d.getDate(),
      full: dateStr.split('T')[0]
    };
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Your Daily Plan</h1>
            <p className="text-slate-500 mt-1">Consistency is the secret to speed.</p>
          </div>
          <button 
            onClick={() => { if(confirm("Start a new 7-day plan?")) initPlan(); }}
            className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest flex items-center gap-2"
          >
            <i className="fa-solid fa-calendar-plus"></i> New Plan
          </button>
        </div>
      </header>

      {/* Week Selector Bar */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-4 no-scrollbar">
        {plan.map((day) => {
          const { weekday, day: dayNum, full } = formatDate(day.date);
          const isSelected = selectedDate === full;
          const isComplete = (completedExercises[full]?.size || 0) > 0;
          
          return (
            <button
              key={full}
              onClick={() => setSelectedDate(full)}
              className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                isSelected 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                  : 'bg-white border-transparent text-slate-400 hover:border-slate-200'
              }`}
            >
              <span className={`text-[10px] font-black uppercase mb-1 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                {weekday}
              </span>
              <span className="text-xl font-bold">{dayNum}</span>
              {isComplete && !isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-50">
                  <i className="fa-solid fa-check text-[8px] text-white"></i>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Day View */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Building your custom training week...</p>
            </div>
          ) : currentDayPlan ? (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <i className={`fa-solid ${currentDayPlan.type === 'strength' ? 'fa-dumbbell' : currentDayPlan.type === 'running' ? 'fa-person-running' : 'fa-couch'} text-8xl`}></i>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    currentDayPlan.type === 'strength' ? 'bg-indigo-100 text-indigo-700' :
                    currentDayPlan.type === 'running' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {currentDayPlan.type}
                  </span>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 mb-2">{currentDayPlan.focus}</h2>
                <p className="text-slate-500 max-w-lg mb-8">{currentDayPlan.session?.notes || "Take it easy and recover today. Quality rest is just as important as the miles."}</p>
                
                {currentDayPlan.type === 'running' && (
                  <button
                    onClick={() => toggleExercise('running-complete')}
                    className={`px-8 py-3 rounded-xl font-bold transition-all ${
                      completedExercises[selectedDate]?.has('running-complete')
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-900 text-white shadow-lg'
                    }`}
                  >
                    {completedExercises[selectedDate]?.has('running-complete') ? 'Run Logged ✓' : 'Complete Run'}
                  </button>
                )}
              </div>

              {currentDayPlan.type === 'strength' && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-emerald-500"></i>
                    Workout Exercises
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentDayPlan.session?.exercises.map(ex => (
                      <ExerciseCard 
                        key={ex.id}
                        exercise={ex}
                        isCompleted={completedExercises[selectedDate]?.has(ex.id)}
                        onToggleComplete={() => toggleExercise(ex.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {isDayFullyComplete && (
                <div className="p-6 bg-emerald-600 rounded-2xl text-white shadow-xl flex flex-col items-center text-center">
                  <i className="fa-solid fa-circle-check text-4xl mb-4"></i>
                  <h3 className="text-2xl font-bold mb-1">Day Complete!</h3>
                  <p className="opacity-90">Great work today. You're building a more resilient engine.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400">No plan found for this date. Refresh to generate one.</p>
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-8">
          <StatsOverview />
          
          <div className="bg-slate-900 p-8 rounded-3xl text-white">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="fa-solid fa-medal text-yellow-400"></i>
              Active Streak
            </h3>
            <div className="text-5xl font-black text-emerald-400 mb-2">
              {Object.keys(completedExercises).length} <span className="text-xl text-slate-500">days</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every strength session reduces your injury risk by 50%. Keep going!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LibraryPage: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
    <div className="mb-10">
      <h2 className="text-3xl font-black mb-2">The Lab</h2>
      <p className="text-slate-500">Study the movements that make you faster.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {EXERCISE_LIBRARY.map(e => (
        <ExerciseCard key={e.id} exercise={e} showToggle={false} />
      ))}
    </div>
  </div>
);

const Navigation: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Plan', icon: 'fa-calendar-day' },
    { path: '/library', label: 'Library', icon: 'fa-dumbbell' },
    { path: '/stats', label: 'Stats', icon: 'fa-chart-simple' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-200 z-50 lg:hidden px-4 py-2">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex flex-col items-center gap-1 w-20 transition-all ${
              location.pathname === item.path ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl ${location.pathname === item.path ? 'bg-emerald-50' : ''}`}>
              <i className={`fa-solid ${item.icon} text-lg`}></i>
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 selection:bg-emerald-100">
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 text-white hidden lg:flex flex-col p-8 z-40">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <i className="fa-solid fa-bolt text-xl"></i>
            </div>
            <span className="text-xl font-black tracking-tighter">STRIDESTRONG</span>
          </div>
          
          <nav className="space-y-6 flex-1">
            <Link to="/" className="flex items-center gap-4 text-emerald-400 font-bold group">
              <i className="fa-solid fa-calendar-check w-5 text-center"></i>
              Daily Plan
            </Link>
            <Link to="/library" className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors">
              <i className="fa-solid fa-dumbbell w-5 text-center"></i>
              Exercise Library
            </Link>
            <Link to="/stats" className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors">
              <i className="fa-solid fa-chart-line w-5 text-center"></i>
              My Progress
            </Link>
          </nav>

          <div className="mt-auto p-5 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <i className="fa-solid fa-person-running text-emerald-400 text-xs"></i>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black">Next Goal</p>
                <p className="text-sm font-bold text-white leading-none">Sub 4:00 Marathon</p>
              </div>
            </div>
            <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[42%]"></div>
            </div>
          </div>
        </aside>

        <main className="lg:ml-64 transition-all duration-300">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/stats" element={<div className="p-8 text-center py-20"><i className="fa-solid fa-chart-area text-6xl text-slate-200 mb-4 block"></i><h2 className="text-2xl font-bold">Progress Dashboard</h2><p className="text-slate-500">Detailed analytics arriving in next update.</p></div>} />
          </Routes>
        </main>

        <Navigation />
      </div>
    </Router>
  );
};

export default App;
