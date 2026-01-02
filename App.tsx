
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ExerciseCard } from './components/ExerciseCard.tsx';
import { StatsOverview } from './components/StatsOverview.tsx';
import { generateWeeklyPlan } from './geminiService.ts';
import { DayPlan, WorkoutSession } from './types.ts';
import { EXERCISE_LIBRARY } from './constants.tsx';

const Dashboard: React.FC = () => {
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [completedExercises, setCompletedExercises] = useState<Record<string, Set<string>>>({});

  const initPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const newPlan = await generateWeeklyPlan("Increase running pace, avoid hip and glute injuries.");
      if (newPlan && newPlan.length > 0) {
        setPlan(newPlan);
        localStorage.setItem('stride_strong_plan', JSON.stringify(newPlan));
      } else {
        throw new Error("Empty plan generated");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to build plan. Please check your internet connection or API key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPlan = localStorage.getItem('stride_strong_plan');
    const savedCompletions = localStorage.getItem('stride_strong_completions');
    
    if (savedPlan) {
      try {
        setPlan(JSON.parse(savedPlan));
        setLoading(false);
      } catch (e) {
        initPlan();
      }
    } else {
      initPlan();
    }

    if (savedCompletions) {
      try {
        const parsed = JSON.parse(savedCompletions);
        const restored: Record<string, Set<string>> = {};
        Object.keys(parsed).forEach(date => {
          restored[date] = new Set(parsed[date]);
        });
        setCompletedExercises(restored);
      } catch (e) {
        console.error("Failed to restore completions", e);
      }
    }
  }, []);

  const currentDayPlan = useMemo(() => {
    return plan.find(d => d.date.split('T')[0] === selectedDate);
  }, [plan, selectedDate]);

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => {
      const dateSet = new Set(prev[selectedDate] || []);
      if (dateSet.has(exerciseId)) dateSet.delete(exerciseId);
      else dateSet.add(exerciseId);
      
      const next = { ...prev, [selectedDate]: dateSet };
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

  if (error) {
    return (
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fa-solid fa-triangle-exclamation text-3xl"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Connection Issue</h2>
        <p className="text-slate-500 mb-8">{error}</p>
        <button onClick={initPlan} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold w-full">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-safe">
      <header className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Daily Plan</h1>
            <p className="text-slate-500 mt-1">Building a resilient engine.</p>
          </div>
          <button 
            onClick={() => { if(confirm("Start a new 7-day plan?")) initPlan(); }}
            className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors uppercase tracking-widest flex items-center gap-2"
          >
            <i className="fa-solid fa-calendar-plus"></i> Reset
          </button>
        </div>
      </header>

      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
        {plan.map((day) => {
          const { weekday, day: dayNum, full } = formatDate(day.date);
          const isSelected = selectedDate === full;
          const isComplete = (completedExercises[full]?.size || 0) > 0;
          
          return (
            <button
              key={full}
              onClick={() => setSelectedDate(full)}
              className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center transition-all border-2 relative ${
                isSelected 
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200 scale-105' 
                  : 'bg-white border-transparent text-slate-400 hover:border-slate-200 shadow-sm'
              }`}
            >
              <span className={`text-[10px] font-black uppercase mb-1 ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                {weekday}
              </span>
              <span className="text-xl font-bold">{dayNum}</span>
              {isComplete && (
                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-white border-emerald-600' : 'bg-emerald-500 border-white'}`}>
                  <i className={`fa-solid fa-check text-[8px] ${isSelected ? 'text-emerald-600' : 'text-white'}`}></i>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-slate-300">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Assembling your schedule...</p>
            </div>
          ) : currentDayPlan ? (
            <div className="space-y-8 animate-fade-in">
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <i className={`fa-solid ${currentDayPlan.type === 'strength' ? 'fa-dumbbell' : currentDayPlan.type === 'running' ? 'fa-person-running' : 'fa-couch'} text-9xl`}></i>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    currentDayPlan.type === 'strength' ? 'bg-indigo-100 text-indigo-700' :
                    currentDayPlan.type === 'running' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {currentDayPlan.type}
                  </span>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">{currentDayPlan.focus}</h2>
                <p className="text-slate-500 max-w-lg mb-8">{currentDayPlan.session?.notes || "Recovery is when the adaptations happen. Listen to your body today."}</p>
                
                {currentDayPlan.type === 'running' && (
                  <button
                    onClick={() => toggleExercise('running-complete')}
                    className={`px-10 py-4 rounded-2xl font-bold transition-all w-full md:w-auto text-center ${
                      completedExercises[selectedDate]?.has('running-complete')
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-900 text-white shadow-xl shadow-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {completedExercises[selectedDate]?.has('running-complete') ? (
                      <><i className="fa-solid fa-check mr-2"></i> Miles Logged</>
                    ) : (
                      'Log Run Performance'
                    )}
                  </button>
                )}
              </div>

              {currentDayPlan.type === 'strength' && (
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-emerald-500"></i>
                    Circuit Exercises
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
                <div className="p-10 bg-emerald-600 rounded-3xl text-white shadow-2xl shadow-emerald-200 flex flex-col items-center text-center animate-fade-in">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
                    <i className="fa-solid fa-star text-3xl"></i>
                  </div>
                  <h3 className="text-3xl font-black mb-2">Target Achieved!</h3>
                  <p className="opacity-90 max-w-xs">Your consistency today is what prevents tomorrow's injury. Enjoy the rest!</p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="space-y-8">
          <StatsOverview />
          
          <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20">
              <i className="fa-solid fa-bolt text-4xl text-emerald-400"></i>
            </div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              Current Streak
            </h3>
            <div className="text-6xl font-black text-emerald-400 mb-2 tracking-tighter">
              {Object.keys(completedExercises).length}
            </div>
            <p className="text-sm text-slate-400 font-medium">
              Daily active streak
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const LibraryPage: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 py-8 pb-32">
    <div className="mb-10">
      <h2 className="text-3xl font-black mb-2 tracking-tight">The Lab</h2>
      <p className="text-slate-500">Master the mechanics of elite running.</p>
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
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-200 z-50 lg:hidden px-4 pb-safe pt-2">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map(item => (
          <Link 
            key={item.path} 
            to={item.path}
            className={`flex flex-col items-center gap-1 w-20 transition-all ${
              location.pathname === item.path ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${location.pathname === item.path ? 'bg-emerald-50' : ''}`}>
              <i className={`fa-solid ${item.icon} text-xl`}></i>
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
            <Route path="/stats" element={<div className="p-8 text-center py-20"><i className="fa-solid fa-chart-area text-6xl text-slate-200 mb-4 block"></i><h2 className="text-2xl font-bold">Progress Dashboard</h2><p className="text-slate-500">Full analytics arriving soon.</p></div>} />
          </Routes>
        </main>

        <Navigation />
      </div>
    </Router>
  );
};

export default App;
