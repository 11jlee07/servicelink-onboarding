import React, { useRef, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import { PRODUCT_GROUPS } from './data';

const SECTIONS = [
  {
    id: 'appraisals',
    label: 'Appraisals',
    description: 'Full opinion of value — by property type and inspection scope',
    groupIds: ['traditionalInterior', 'traditionalExterior', 'hybrid', 'multiFamily', 'landSpecial'],
  },
  {
    id: 'reviewsInspections',
    label: 'Reviews & Inspections',
    description: 'Condition reports, desk reviews, and field reviews — no full opinion required',
    groupIds: ['desktopReview', 'inspectionOnly'],
  },
  {
    id: 'agencySpecialty',
    label: 'Agency & Specialty',
    description: 'Agency-mandated forms, income analysis, and program-specific products',
    groupIds: ['govAgency', 'rentalIncome'],
  },
];

/* ─── Indeterminate checkbox ──────────────────────────────────────── */
const IndeterminateCheckbox = ({ checked, indeterminate, onChange, className = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={`w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0 ${className}`}
    />
  );
};

const getGroupProducts = (group) => group.subgroups.flatMap((s) => s.products);

/* ─── Main component ──────────────────────────────────────────────── */
const ProductSelection = ({ selected, onChange }) => {
  const [expanded, setExpanded] = useState({ appraisals: true, reviewsInspections: false, agencySpecialty: false });
  const groupMap = Object.fromEntries(PRODUCT_GROUPS.map((g) => [g.id, g]));

  const toggleSection = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleProduct = (product) => {
    const next = new Set(selected);
    next.has(product) ? next.delete(product) : next.add(product);
    onChange(next);
  };

  const toggleSectionAll = (section) => {
    const products = section.groupIds.flatMap((id) => getGroupProducts(groupMap[id]));
    const allSelected = products.every((p) => selected.has(p));
    const next = new Set(selected);
    if (allSelected) products.forEach((p) => next.delete(p));
    else products.forEach((p) => next.add(p));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-slate-900 mb-1">Which products do you offer?</h3>
        <p className="text-sm text-slate-500 mb-4">
          Select the appraisal types you're qualified and willing to complete.
          <span className="ml-2 font-medium text-blue-600">{selected.size} selected</span>
        </p>
      </div>

      {SECTIONS.map((section) => {
        const sectionGroups = section.groupIds.map((id) => groupMap[id]).filter(Boolean);
        const sectionProducts = sectionGroups.flatMap(getGroupProducts);
        const selectedCount = sectionProducts.filter((p) => selected.has(p)).length;
        const allSelected = selectedCount === sectionProducts.length;
        const someSelected = selectedCount > 0 && !allSelected;
        const isExpanded = expanded[section.id];

        return (
          <div key={section.id} className="border border-slate-200 rounded-exos overflow-hidden">

            {/* Section accordion header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-slate-50 border-b border-slate-200">
              <IndeterminateCheckbox
                checked={allSelected}
                indeterminate={someSelected}
                onChange={() => toggleSectionAll(section)}
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">{section.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{section.description}</p>
                <p className="text-xs text-slate-400 mt-0.5">{selectedCount} / {sectionProducts.length} selected</p>
              </div>
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors flex-shrink-0"
              >
                {isExpanded
                  ? <><ChevronDown className="w-3.5 h-3.5" /> Hide</>
                  : <><ChevronRight className="w-3.5 h-3.5" /> Show all</>
                }
              </button>
            </div>

            {/* Expanded: product groups as labeled sections */}
            {isExpanded && (
              <div className="divide-y divide-slate-100">
                {sectionGroups.map((group) => {
                  const groupProducts = getGroupProducts(group);
                  const subgroup = group.subgroups[0];
                  return (
                    <div key={group.id} className="px-5 py-4">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        {group.label}
                        {subgroup?.label && (
                          <span className="normal-case font-normal tracking-normal text-slate-400 ml-1.5">· {subgroup.label}</span>
                        )}
                      </p>
                      <div className="space-y-0.5">
                        {groupProducts.map((product) => {
                          const checked = selected.has(product);
                          return (
                            <label
                              key={product}
                              className="flex items-center gap-3 py-1.5 px-2 rounded-exos hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                                checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                              }`}>
                                {checked && <Check className="w-2.5 h-2.5 text-white" />}
                              </div>
                              <input type="checkbox" checked={checked} onChange={() => toggleProduct(product)} className="sr-only" />
                              <span className="text-sm text-slate-700">{product}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProductSelection;
