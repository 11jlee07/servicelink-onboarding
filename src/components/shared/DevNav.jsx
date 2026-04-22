import React, { useState } from 'react';
import { Map, ChevronUp, X } from 'lucide-react';

const SCREENS = [
  { screen: 1,  label: 'Marketing',            group: 'Pre-Onboarding' },
  { screen: 2,  label: 'Account Creation',      group: 'Pre-Onboarding' },
  { screen: 3,  label: 'Document Upload',        group: 'Onboarding' },
  { screen: 4,  label: 'Basic Info',             group: 'Onboarding' },
  { screen: 5,  label: 'W-9 Form',               group: 'Onboarding' },
  { screen: 7,  label: 'License Upload',          group: 'Onboarding' },
  { screen: 8,  label: 'Screening',               group: 'Onboarding' },
  { screen: 10, label: 'Application Submitted',  group: 'Post-Onboarding' },
  { screen: 11, label: 'Coverage & Fees',         group: 'Post-Onboarding' },
];

const GROUPS = ['Pre-Onboarding', 'Onboarding', 'Post-Onboarding'];

const DevNav = ({ currentScreen, onNavigate }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col items-end gap-2">
      {open && (
        <div className="bg-white border border-slate-200 rounded-exos shadow-2xl w-60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Jump to screen</p>
            <button type="button" onClick={() => setOpen(false)}
              className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="max-h-[70vh] overflow-y-auto py-2">
            {GROUPS.map((group) => (
              <div key={group}>
                <p className="px-4 pt-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{group}</p>
                {SCREENS.filter((s) => s.group === group).map(({ screen, label }) => {
                  const active = screen === currentScreen;
                  return (
                    <button
                      key={screen}
                      type="button"
                      onClick={() => { onNavigate(screen); setOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                        active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {screen}
                      </span>
                      {label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg text-sm font-semibold transition-all ${
          open
            ? 'bg-slate-900 text-white'
            : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-xl'
        }`}
      >
        <Map className="w-4 h-4" />
        <span>Navigate</span>
        <ChevronUp className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? '' : 'rotate-180'}`} />
      </button>
    </div>
  );
};

export default DevNav;
