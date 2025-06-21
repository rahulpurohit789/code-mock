import React from 'react';

const PHASES = [
  { key: 'introduction', label: 'Introduction' },
  { key: 'core_topics', label: 'Core Topics' },
  { key: 'dsa_problem', label: 'DSA Problem' },
  { key: 'wrap_up', label: 'Wrap-up' }
];

export default function InterviewProgressBar({ phase, onPhaseClick }) {
  const currentIdx = PHASES.findIndex(p => p.key === phase);
  
  const handlePhaseClick = (newPhase) => {
    if (onPhaseClick) {
      onPhaseClick(newPhase);
    }
  };

  return (
    <div className="flex items-center space-x-2 py-2 px-4">
      {PHASES.map((p, idx) => (
        <React.Fragment key={p.key}>
          <div 
            className={`flex items-center space-x-1 cursor-pointer transition-colors duration-200 ${
              idx <= currentIdx 
                ? 'font-bold text-orange-500 hover:text-orange-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
            onClick={() => handlePhaseClick(p.key)}
          >
            <span className={`w-2 h-2 rounded-full ${idx <= currentIdx ? 'bg-orange-500' : 'bg-gray-300'}`}></span>
            <span className="text-sm">{p.label}</span>
          </div>
          {idx < PHASES.length - 1 && <span className="text-gray-300 mx-2">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
} 