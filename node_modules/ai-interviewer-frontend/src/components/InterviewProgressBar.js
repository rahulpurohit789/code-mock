import React from 'react';

const PHASES = [
  { key: 'introduction', label: 'Introduction' },
  { key: 'core_topics', label: 'Core Topics' },
  { 
    key: 'dsa_progressive', 
    label: 'DSA Progressive',
    subPhases: [
      { key: 'easy', label: 'Easy Problem' },
      { key: 'complexity', label: 'Complexity Analysis' },
      { key: 'optimization', label: 'Optimization' },
      { key: 'medium_hard', label: 'Medium-Hard Problem' },
      { key: 'feedback', label: 'Feedback' }
    ]
  },
  { key: 'wrap_up', label: 'Wrap-up' }
];

export default function InterviewProgressBar({ phase, dsaPhase, onPhaseClick }) {
  const currentPhaseIdx = PHASES.findIndex(p => p.key === phase);
  
  const handlePhaseClick = (newPhase) => {
    if (onPhaseClick) {
      onPhaseClick(newPhase);
    }
  };

  const getCurrentSubPhaseIdx = () => {
    if (phase === 'dsa_progressive' && dsaPhase) {
      const dsaPhaseData = PHASES.find(p => p.key === 'dsa_progressive');
      return dsaPhaseData.subPhases.findIndex(sp => sp.key === dsaPhase);
    }
    return -1;
  };

  const currentSubPhaseIdx = getCurrentSubPhaseIdx();

  return (
    <div className="flex items-center space-x-2 py-2 px-4">
      {PHASES.map((p, idx) => (
        <React.Fragment key={p.key}>
          <div className="flex flex-col items-center">
            <div 
              className={`flex items-center space-x-1 cursor-pointer transition-colors duration-200 ${
                idx <= currentPhaseIdx 
                  ? 'font-bold text-orange-500 hover:text-orange-400' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => handlePhaseClick(p.key)}
            >
              <span className={`w-2 h-2 rounded-full ${idx <= currentPhaseIdx ? 'bg-orange-500' : 'bg-gray-300'}`}></span>
              <span className="text-sm">{p.label}</span>
            </div>
            
            {/* Show sub-phases for DSA Progressive */}
            {p.key === 'dsa_progressive' && p.subPhases && idx <= currentPhaseIdx && (
              <div className="flex items-center space-x-1 mt-1">
                {p.subPhases.map((subPhase, subIdx) => (
                  <React.Fragment key={subPhase.key}>
                    <div 
                      className={`flex items-center space-x-1 cursor-pointer transition-colors duration-200 ${
                        subIdx <= currentSubPhaseIdx 
                          ? 'text-orange-400 hover:text-orange-300' 
                          : 'text-gray-500 hover:text-gray-300'
                      }`}
                      onClick={() => onPhaseClick && onPhaseClick('dsa_progressive', subPhase.key)}
                    >
                      <span className={`w-1 h-1 rounded-full ${subIdx <= currentSubPhaseIdx ? 'bg-orange-400' : 'bg-gray-400'}`}></span>
                      <span className="text-xs">{subPhase.label}</span>
                    </div>
                    {subIdx < p.subPhases.length - 1 && <span className="text-gray-400 mx-1 text-xs">•</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          {idx < PHASES.length - 1 && <span className="text-gray-300 mx-2">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
} 