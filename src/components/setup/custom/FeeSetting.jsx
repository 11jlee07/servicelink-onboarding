import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { categorizeProducts } from './data';

const fmt = (val) => val.replace(/[^0-9]/g, '');

const FeeInput = ({ label, value, onChange, hint }) => (
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
        className="w-full border border-slate-200 rounded-xl py-2.5 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={`Fee for ${label}`}
      />
    </div>
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

/* ─── Collapsible fee category ────────────────────────────────────── */
const FeeCategory = ({ title, products, children, productFees }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
        <p className="font-bold text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''} selected</p>
      </div>
      <div className="px-5 py-4 space-y-4">
        {children}
        {/* Expandable product list */}
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
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            {products.map((p) => (
              <div key={p} className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100 last:border-b-0">
                <span className="text-sm text-slate-700">{p}</span>
                <span className="text-sm font-semibold text-slate-900 font-mono">
                  {productFees[p] ? `$${productFees[p]}` : <span className="text-slate-400">—</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────────── */
const FeeSetting = ({ selectedProducts, fees, onChange }) => {
  // fees = { productName: '450', ... }
  const cats = categorizeProducts([...selectedProducts]);

  const setFee = (product, val) => onChange({ ...fees, [product]: fmt(val) });

  const setBulk = (products, val) => {
    const next = { ...fees };
    products.forEach((p) => { next[p] = fmt(val); });
    onChange(next);
  };

  /* Bulk field component */
  const BulkField = ({ products, defaultPrice, hint }) => {
    const [bulk, setBulk_] = useState(defaultPrice || '');
    const [applyAll, setApplyAll] = useState(true);

    useEffect(() => {
      if (applyAll && bulk) setBulk(products, bulk);
    }, [bulk, applyAll]);

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <FeeInput
              label="Default price"
              value={bulk}
              onChange={(v) => { setBulk_(v); if (applyAll) setBulk(products, v); }}
              hint={hint}
            />
          </div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={applyAll}
            onChange={(e) => setApplyAll(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-600"
          />
          <span className="text-sm text-slate-600">Apply to all products in this category</span>
        </label>
        {!applyAll && (
          <div className="rounded-xl border border-slate-100 overflow-hidden mt-2">
            {products.map((p) => (
              <div key={p} className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-b-0">
                <span className="text-sm text-slate-700 flex-1">{p}</span>
                <div className="w-28">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={fees[p] || ''}
                      onChange={(e) => setFee(p, e.target.value)}
                      placeholder="0"
                      className="w-full border border-slate-200 rounded-lg py-1.5 pl-7 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const hasMultiFamily = cats.multiFamily2.length || cats.multiFamily3.length || cats.multiFamily4.length;
  const multiFamilyAll = [...cats.multiFamily2, ...cats.multiFamily3, ...cats.multiFamily4];

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-slate-900 mb-1">Set your fees</h3>
        <p className="text-sm text-slate-500 mb-4">
          We've grouped similar products to make pricing easier. Enter a price once, apply to all.
        </p>
      </div>

      {cats.fullInterior.length > 0 && (
        <FeeCategory title="Full Interior Inspections" products={cats.fullInterior} productFees={fees}>
          <BulkField products={cats.fullInterior} defaultPrice="450" hint="Typical range: $400–$550" />
        </FeeCategory>
      )}

      {cats.exterior.length > 0 && (
        <FeeCategory title="Exterior-Only Inspections" products={cats.exterior} productFees={fees}>
          <BulkField products={cats.exterior} defaultPrice="250" hint="Typical range: $200–$300" />
        </FeeCategory>
      )}

      {cats.desktop.length > 0 && (
        <FeeCategory title="Desktop / Desk Review" products={cats.desktop} productFees={fees}>
          <BulkField products={cats.desktop} defaultPrice="175" hint="Typical range: $150–$225" />
        </FeeCategory>
      )}

      {hasMultiFamily > 0 && (
        <FeeCategory title="Multi-Family" products={multiFamilyAll} productFees={fees}>
          <div className="grid grid-cols-3 gap-3">
            {cats.multiFamily2.length > 0 && (
              <FeeInput
                label={`2-Unit (${cats.multiFamily2.length})`}
                value={fees[cats.multiFamily2[0]] || ''}
                onChange={(v) => setBulk(cats.multiFamily2, v)}
                hint="~$550"
              />
            )}
            {cats.multiFamily3.length > 0 && (
              <FeeInput
                label={`3-Unit (${cats.multiFamily3.length})`}
                value={fees[cats.multiFamily3[0]] || ''}
                onChange={(v) => setBulk(cats.multiFamily3, v)}
                hint="~$650"
              />
            )}
            {cats.multiFamily4.length > 0 && (
              <FeeInput
                label={`4-Unit (${cats.multiFamily4.length})`}
                value={fees[cats.multiFamily4[0]] || ''}
                onChange={(v) => setBulk(cats.multiFamily4, v)}
                hint="~$750"
              />
            )}
          </div>
        </FeeCategory>
      )}

      {cats.fieldReview.length > 0 && (
        <FeeCategory title="Field Review" products={cats.fieldReview} productFees={fees}>
          <BulkField products={cats.fieldReview} defaultPrice="300" hint="Typical range: $275–$350" />
        </FeeCategory>
      )}

      {cats.specialized.length > 0 && (
        <FeeCategory title="Specialized Products" products={cats.specialized} productFees={fees}>
          <div className="space-y-3">
            <p className="text-xs text-slate-500">Set individual prices for each product:</p>
            {cats.specialized.map((p) => (
              <FeeInput
                key={p}
                label={p}
                value={fees[p] || ''}
                onChange={(v) => setFee(p, v)}
              />
            ))}
          </div>
        </FeeCategory>
      )}

      {selectedProducts.size === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm">
          Go back and select products to set fees.
        </div>
      )}
    </div>
  );
};

export default FeeSetting;
