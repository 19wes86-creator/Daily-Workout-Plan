
import React from 'react';
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  isCompleted?: boolean;
  onToggleComplete?: () => void;
  showToggle?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ 
  exercise, 
  isCompleted, 
  onToggleComplete,
  showToggle = true
}) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${isCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}>
      <div className="aspect-video w-full overflow-hidden">
        <img 
          src={exercise.image} 
          alt={exercise.name} 
          className={`w-full h-full object-cover transition-transform duration-500 ${isCompleted ? 'grayscale' : 'group-hover:scale-105'}`}
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-slate-900/80 text-white rounded-full backdrop-blur-sm">
            {exercise.targetArea}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-xl font-bold ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
            {exercise.name}
          </h3>
          <span className="text-emerald-600 font-bold">{exercise.reps}</span>
        </div>
        
        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
          {exercise.description}
        </p>
        
        <div className="space-y-2 mb-6">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Pro Tips</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            {exercise.tips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <i className="fa-solid fa-circle-check text-emerald-500 mt-1 text-[10px]"></i>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {showToggle && (
          <button
            onClick={onToggleComplete}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isCompleted 
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' 
                : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
            }`}
          >
            {isCompleted ? (
              <><i className="fa-solid fa-check"></i> Completed</>
            ) : (
              'Mark as Done'
            )}
          </button>
        )}
      </div>
    </div>
  );
};
