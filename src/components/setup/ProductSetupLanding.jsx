import React from 'react';
import { Zap, SlidersHorizontal, ArrowRight, Clock, Info } from 'lucide-react';

const ProductSetupLanding = ({ onQuick, onCustom, onBack }) => (
  <div className="max-w-4xl mx-auto px-4 py-12">
    <button
      type="button"
      onClick={onBack}
      className="text-sm text-slate-500 hover:text-slate-700 mb-8 flex items-center gap-1.5 transition-colors"
    >
      ← Back to application
    </button>

    <div className="mb-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Set Up Product, Fees and Coverage</h1>
      <p className="text-slate-500">Choose how you'd like to get started. You can update everything later from your dashboard.</p>
    </div>

    <div className="grid sm:grid-cols-2 gap-4">
      {/* Quick Setup */}
      <button
        type="button"
        onClick={onQuick}
        className="group flex flex-col gap-4 p-6 bg-white border-2 border-slate-200 hover:border-blue-400 rounded-2xl text-left transition-all hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 bg-slate-100 group-hover:bg-blue-50 rounded-xl flex items-center justify-center transition-colors">
            <Zap className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
          </div>
          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5" /> ~2 min
          </span>
        </div>

        <div>
          <p className="font-bold text-slate-900 mb-1">Quick Setup</p>
          <p className="text-sm text-slate-500 leading-relaxed">Start with sensible defaults. We'll pre-select common products and suggest market-rate fees.</p>
        </div>

        <ul className="space-y-1.5 text-sm text-slate-600">
          {[
            'ZIP-based coverage picker',
            '6 core products pre-selected',
            'Suggested fees by inspection type',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        {/* Nudge toward custom */}
        <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 mt-auto">
          <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Need the full suite of 44 products or county-level coverage? Use <span className="font-semibold text-slate-700">Custom Setup</span> instead.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm">
          Get started <ArrowRight className="w-4 h-4" />
        </div>
      </button>

      {/* Custom Setup */}
      <button
        type="button"
        onClick={onCustom}
        className="group flex flex-col gap-4 p-6 bg-white border-2 border-slate-200 hover:border-blue-400 rounded-2xl text-left transition-all hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div className="w-11 h-11 bg-slate-100 group-hover:bg-blue-50 rounded-xl flex items-center justify-center transition-colors">
            <SlidersHorizontal className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
          </div>
          <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5" /> ~8 min
          </span>
        </div>

        <div>
          <p className="font-bold text-slate-900 mb-1">Custom Setup</p>
          <p className="text-sm text-slate-500 leading-relaxed">Full control over every product, county-level coverage, and per-product pricing.</p>
        </div>

        <ul className="space-y-1.5 text-sm text-slate-600">
          {[
            'State → county → ZIP coverage',
            'Full product catalog (44 products)',
            'Per-product fee overrides',
          ].map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm mt-auto pt-6">
          Get started <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    </div>
  </div>
);

export default ProductSetupLanding;
