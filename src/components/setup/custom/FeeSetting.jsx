import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { categorizeProducts } from './data';

const fmt = (val) => String(val).replace(/[^0-9]/g, '');

/* ─── Single fee input with $ prefix ─────────────────────────────── */
const FeeInput = ({ label, value, onChange }) => (
  <div>
    {label && <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>}
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">$</span>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(fmt(e.target.value))}
        placeholder="0"
        className="w-full border border-slate-200 rounded-exos-sm py-2.5 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={label ? `Fee for ${label}` : 'Fee'}
      />
    </div>
  </div>
);

/* ─── Bulk pricing field ──────────────────────────────────────────── */
const BulkField = ({ products, fees, onBulk, onSingle }) => {
  const [bulk, setBulk] = useState('');
  const [applyAll, setApplyAll] = useState(true);

  const handleBulkChange = (v) => {
    setBulk(v);
    if (applyAll) onBulk(products, v);
  };

  const handleToggleApplyAll = (checked) => {
    setApplyAll(checked);
    if (checked && bulk) onBulk(products, bulk);
  };

  return (
    <div className="space-y-3">
      <FeeInput label="Default price" value={bulk} onChange={handleBulkChange} />
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={applyAll}
          onChange={(e) => handleToggleApplyAll(e.target.checked)}
          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
        />
        <span className="text-sm text-slate-600">Apply to all products in this category</span>
      </label>
      {!applyAll && (
        <div className="rounded-exos border border-slate-200 overflow-hidden mt-1">
          {products.map((p) => (
            <div key={p} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-b-0 bg-white">
              <span className="text-sm text-slate-700 flex-1">{p}</span>
              <div className="w-32 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={fees[p] || ''}
                  onChange={(e) => onSingle(p, fmt(e.target.value))}
                  placeholder="0"
                  className="w-full border border-slate-200 rounded-exos py-1.5 pl-7 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Collapsible fee category ────────────────────────────────────── */
const FeeCategory = ({ title, products, children, productFees }) => {
  const [open, setOpen] = useState(false);
  const priced = products.filter((p) => productFees[p] && productFees[p] !== '0').length;

  return (
    <div className="border border-slate-200 rounded-exos overflow-hidden">
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-900 text-sm">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          priced === products.length
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-amber-50 text-amber-600'
        }`}>
          {priced}/{products.length} priced
        </span>
      </div>
      <div className="px-5 py-4 space-y-4">
        {children}
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 font-medium transition-colors"
          aria-expanded={open}
        >
          {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {open ? 'Hide' : 'Show'} products ({products.length})
        </button>
        {open && (
          <div className="rounded-exos border border-slate-100 overflow-hidden">
            {products.map((p) => (
              <div key={p} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-b-0">
                <span className="text-sm text-slate-700">{p}</span>
                <span className="text-sm font-semibold text-slate-900 font-mono">
                  {productFees[p] && productFees[p] !== '0' ? `$${productFees[p]}` : <span className="text-slate-400">—</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CATEGORY_TITLES = {
  traditionalInterior: 'Traditional Interior Appraisals',
  traditionalExterior: 'Traditional Exterior Appraisals',
  hybrid: 'Hybrid Valuation Products',
  multiFamily: 'Multi-Family Appraisals',
  landSpecial: 'Land & Special-Use Appraisals',
  desktopReview: 'Desktop Reviews',
  inspectionOnly: 'Inspection-Only / Condition Reports',
  govAgency: 'Government / Agency-Specific Forms',
  rentalIncome: 'Rental & Income Analysis Products',
};

/* ─── Main component ──────────────────────────────────────────────── */
const FeeSetting = ({ selectedProducts, fees, onChange }) => {
  const cats = categorizeProducts([...selectedProducts]);

  const handleSingle = (product, val) => onChange({ ...fees, [product]: val });

  const handleBulk = (products, val) => {
    const next = { ...fees };
    products.forEach((p) => { next[p] = fmt(val); });
    onChange(next);
  };

  if (selectedProducts.size === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">
        Go back and select products to set fees.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-slate-900 mb-1">Set your fees</h3>
        <p className="text-sm text-slate-500 mb-4">
          Enter a default price to apply to all products in a category, or uncheck to set prices individually.
        </p>
      </div>

      {Object.entries(CATEGORY_TITLES).map(([key, title]) => {
        const products = cats[key];
        if (!products || products.length === 0) return null;
        return (
          <FeeCategory key={key} title={title} products={products} productFees={fees}>
            <BulkField products={products} fees={fees} onBulk={handleBulk} onSingle={handleSingle} />
          </FeeCategory>
        );
      })}
    </div>
  );
};

export default FeeSetting;
