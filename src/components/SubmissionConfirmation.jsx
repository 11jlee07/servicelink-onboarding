import React from 'react';
import { CheckCircle, Loader, Calendar, BookOpen, Map } from 'lucide-react';

const SubmissionConfirmation = ({ state }) => {
  const email = state.accountData.email || state.marketingData.email;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Success header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-5">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
        <p className="text-slate-500 text-lg max-w-sm mx-auto">
          You're all set. We're reviewing your application and running background checks.
        </p>
      </div>

      {/* Status card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">What's happening now</h2>
        <div className="space-y-4">
          {[
            { label: 'Background check', sub: 'Typically completes within 1 business day' },
            { label: 'License verification', sub: 'Confirmed via ASC.gov' },
            { label: 'Document review', sub: 'W-9 and E&O insurance review' },
          ].map(({ label, sub }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Loader className="w-4 h-4 text-blue-600 animate-spin" />
              </div>
              <div>
                <p className="font-medium text-slate-900 text-sm">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-5 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            We'll email <strong>{email}</strong> when your application is approved.
          </p>
          <p className="text-sm text-slate-500 mt-1">Typical review time: <strong>1–2 business days</strong></p>
        </div>
      </div>

      {/* While you wait */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 className="font-semibold text-slate-900 mb-4">While you wait, you can:</h2>
        <div className="space-y-3">
          {[
            {
              icon: Map,
              title: 'Set Up Coverage & Fees',
              desc: 'Define your service areas and appraisal pricing',
            },
            {
              icon: Calendar,
              title: 'Sync Your Calendar',
              desc: 'Connect Google or Outlook for automatic scheduling',
            },
            {
              icon: BookOpen,
              title: 'Watch Platform Training',
              desc: 'Learn how to manage orders in the ServiceLink portal',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <button
              key={title}
              type="button"
              className="w-full flex items-start gap-4 p-4 border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl text-left transition-all group"
            >
              <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                <Icon className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-900">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
      >
        Go to Dashboard →
      </button>

      <p className="text-center text-xs text-slate-400 mt-4">
        Application ID: <strong>SL-{Date.now().toString(36).toUpperCase()}</strong>
      </p>
    </div>
  );
};

export default SubmissionConfirmation;
