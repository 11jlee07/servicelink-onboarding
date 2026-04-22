import React, { useState, useEffect } from 'react';
import { CheckCircle, Map, CalendarDays, PlayCircle } from 'lucide-react';
import { ExosIllustration, ExosHalo, ExosIcon } from './shared/ExosIcon';

const StatusRow = ({ label, sub, done }) => (
  <div className="flex items-center gap-3">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-50' : 'bg-blue-50'}`}>
      {done
        ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        : <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      }
    </div>
    <div className="min-w-0">
      <p className="text-sm text-slate-900">{label}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const SubmissionConfirmation = ({ state, setState, onSetupClick }) => {
  const email = state.accountData.email || state.marketingData.email;
  const bgDone = !!state.bgCheckAnimationDone;

  useEffect(() => {
    if (bgDone) return;
    const t = setTimeout(() => {
      setState(prev => ({ ...prev, bgCheckAnimationDone: true }));
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Success header */}
      <div className="text-center mb-8">
        <ExosHalo size={120} className="mx-auto mb-4">
          <ExosIllustration name="mail-open-checkmark" size={76} />
        </ExosHalo>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">You're in!</h1>
        <p className="text-slate-500 text-base max-w-md mx-auto">
          Your application is submitted and your verifications are running. We'll email <strong className="text-slate-700">{email}</strong> once you're approved.
        </p>
      </div>

      {/* Two-column cards */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 mb-6">

        {/* What's happening now */}
        <div className="bg-white rounded-exos shadow-card border border-slate-200 p-5 flex flex-col">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0">What's happening now</p>
          <div className="flex flex-col gap-3.5 pt-5">
            <StatusRow
              label="Background check"
              sub={bgDone ? null : 'Completes in a few minutes'}
              done={bgDone}
            />
            <StatusRow label="License verification" sub="Confirmed via ASC.gov" done={true} />
            <StatusRow label="E&O insurance" sub="Confirmed" done={true} />
          </div>

        </div>

        {/* While you wait */}
        <div className="bg-white rounded-exos shadow-card border border-slate-200 p-5 flex-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">While you wait</p>
          <div className="space-y-2.5">
            {[
              {
                icon: Map,
                title: 'Set Up Coverage & Fees',
                desc: 'Service area, products, and rates',
                onClick: onSetupClick,
                highlight: !state.setup,
              },
              {
                icon: CalendarDays,
                title: 'Sync Your Calendar',
                desc: 'Google or Outlook for auto-scheduling',
                onClick: null,
              },
              {
                icon: PlayCircle,
                title: 'Watch Platform Training',
                desc: 'Learn to manage orders in the portal',
                onClick: null,
              },
            ].map(({ icon: Icon, title, desc, onClick, highlight }) => (
              <button
                key={title}
                type="button"
                onClick={onClick || undefined}
                className={`w-full flex items-center gap-3 p-3 border rounded-exos text-left transition-all group
                  ${highlight
                    ? 'border-blue-300 bg-blue-50/40 hover:border-blue-400 hover:bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                  }`}
              >
                <div className={`w-9 h-9 rounded-exos flex items-center justify-center flex-shrink-0 transition-colors
                  ${highlight ? 'bg-blue-100 group-hover:bg-blue-200' : 'bg-slate-100 group-hover:bg-blue-50'}`}>
                  <Icon className={`w-4 h-4 ${highlight ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{title}</p>
                  <p className="text-xs text-slate-400 truncate">{desc}</p>
                </div>
                {highlight && (
                  <span className="text-xs bg-blue-600 text-white font-bold uppercase px-2 py-0.5 rounded-exos-pill flex-shrink-0">
                    Start
                  </span>
                )}
                {state.setup && title.includes('Coverage') && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

      </div>

      <p className="text-center text-xs text-slate-400">
        Application ID: <strong>SL-{Date.now().toString(36).toUpperCase()}</strong>
      </p>
    </div>
  );
};

export default SubmissionConfirmation;
