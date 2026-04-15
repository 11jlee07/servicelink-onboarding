import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  'Basic Info',
  'Business Type',
  'W-9 Info',
  'W-9 Review',
  'License',
  'Insurance',
  'Bkg Check',
  'Agreement',
];

const ProgressBar = ({ currentStep }) => {
  return (
    <div className="flex items-center w-full" role="progressbar" aria-valuenow={currentStep} aria-valuemin={1} aria-valuemax={7}>
      {STEPS.map((label, index) => {
        const step = index + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <React.Fragment key={step}>
            {/* Step node */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
                  transition-all duration-300
                  ${isCompleted ? 'bg-emerald-500 text-white' : ''}
                  ${isActive ? 'bg-blue-600 text-white ring-4 ring-blue-100' : ''}
                  ${!isCompleted && !isActive ? 'bg-slate-100 text-slate-400' : ''}
                `}
                aria-label={`Step ${step}: ${label}`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : step}
              </div>
              <span
                className={`
                  text-xs mt-1 hidden lg:block whitespace-nowrap
                  ${isActive ? 'text-blue-600 font-medium' : ''}
                  ${isCompleted ? 'text-emerald-600' : ''}
                  ${!isCompleted && !isActive ? 'text-slate-400' : ''}
                `}
              >
                {label}
              </span>
            </div>

            {/* Connector */}
            {index < STEPS.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-1 transition-all duration-300
                  ${isCompleted ? 'bg-emerald-400' : 'bg-slate-200'}
                `}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressBar;
