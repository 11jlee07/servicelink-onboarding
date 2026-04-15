import React, { useState } from 'react';
import { Check } from 'lucide-react';
import CoverageHierarchy from './CoverageHierarchy';
import ProductSelection from './ProductSelection';
import FeeSetting from './FeeSetting';
import { categorizeProducts } from './data';


const STEPS = [
  { id: 'coverage',  label: 'Coverage' },
  { id: 'products',  label: 'Products' },
  { id: 'fees',      label: 'Fees' },
];

const CustomSetupFlow = ({ state, setState, onBack, onDone }) => {
  const [step, setStep] = useState(0);

  // Coverage: { [stateCode]: 'all' | string[] }
  const [coverage, setCoverage] = useState({});
  // Products: Set<string>
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  // Fees: { productName: string }
  const [fees, setFees] = useState({});

  /* ── Validation per step ───────────────────────────────────────── */
  const canAdvance = [
    Object.keys(coverage).length > 0 &&               // at least 1 state
      Object.entries(coverage).every(([, v]) =>
        v === 'all' || Object.keys(v).length > 0      // if customized, must have ≥1 county
      ),
    selectedProducts.size > 0,                        // at least 1 product
    (() => {
      if (selectedProducts.size === 0) return false;
      const cats = categorizeProducts([...selectedProducts]);
      const allProducts = Object.values(cats).flat();
      return allProducts.every((p) => fees[p] !== undefined && fees[p] !== '');
    })(),
  ];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      const nextStep = step + 1;
      setStep(nextStep);
    } else {
      setState((prev) => ({
        ...prev,
        setup: {
          type: 'custom',
          coverage,
          products: [...selectedProducts],
          fees,
        },
      }));
      onDone();
    }
  };

  const handleBack = () => {
    if (step === 0) onBack();
    else setStep((p) => p - 1);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Back */}
      <button
        type="button"
        onClick={handleBack}
        className="text-sm text-slate-500 hover:text-slate-700 mb-6 flex items-center gap-1.5 transition-colors"
      >
        ← {step === 0 ? 'Back to options' : `Back to ${STEPS[step - 1].label}`}
      </button>

      {/* Header */}
      <div className="mb-6">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Custom Setup</span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Set Up Product, Fees and Coverage</h1>
      </div>

      {/* Mini stepper */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  done    ? 'bg-emerald-500 text-white' :
                  active  ? 'bg-blue-600 text-white ring-4 ring-blue-100' :
                            'bg-slate-100 text-slate-400'
                }`}>
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs mt-1 font-medium ${
                  active ? 'text-blue-600' : done ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 transition-colors ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        {step === 0 && (
          <CoverageHierarchy value={coverage} onChange={setCoverage} />
        )}
        {step === 1 && (
          <ProductSelection selected={selectedProducts} onChange={setSelectedProducts} />
        )}
        {step === 2 && (
          <FeeSetting selectedProducts={selectedProducts} fees={fees} onChange={setFees} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="px-6 py-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:border-slate-300 transition-colors"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canAdvance[step]}
          className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-colors"
        >
          {step < STEPS.length - 1 ? `Continue to ${STEPS[step + 1].label} →` : 'Save & Finish →'}
        </button>
      </div>

      {!canAdvance[step] && (
        <p className="text-center text-xs text-slate-400 mt-3">
          {step === 0 && 'Add at least one state, and select at least one county if customizing'}
          {step === 1 && 'Select at least one product to continue'}
          {step === 2 && 'All products must have a price set'}
        </p>
      )}
    </div>
  );
};

export default CustomSetupFlow;
