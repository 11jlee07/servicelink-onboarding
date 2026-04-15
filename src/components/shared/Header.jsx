import React from 'react';
import ProgressBar from './ProgressBar';
import { HelpCircle } from 'lucide-react';

const Header = ({ progressStep, onStepClick }) => {
  return (
    <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-6">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs tracking-tight">SL</span>
          </div>
          <span className="font-bold text-slate-900 text-base hidden sm:block">ServiceLink</span>
        </div>

        {/* Progress bar (center) */}
        {progressStep && (
          <div className="flex-1 min-w-0">
            <ProgressBar currentStep={progressStep} onStepClick={onStepClick} />
          </div>
        )}

        {/* Help link */}
        <a
          href="#"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0"
          aria-label="Get help"
        >
          <HelpCircle className="w-4 h-4" />
          <span className="hidden sm:block">Help</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
