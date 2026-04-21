import React, { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import { ExosIllustration } from './shared/ExosIcon';
import InfoTooltip from './shared/InfoTooltip';
import NavFooter from './shared/NavFooter';
import MailingAddressQuestion from './w9/MailingAddressQuestion';
import { formatSSN, formatEIN } from '../utils/validation';

const STRUCTURES = [
  { id: 'sole_prop',    title: 'Individual / Sole Proprietor', illustration: 'Individual',        tooltip: 'Just me working for myself — no LLC or corporation' },
  { id: 'single_llc',  title: 'Single-Member LLC',            illustration: 'Single Member LLC',  tooltip: 'I have an LLC with only me as the owner' },
  { id: 'multi_llc',   title: 'Multi-Member LLC',             illustration: 'Multi-Member LLC',   tooltip: 'I have an LLC with multiple owners or partners' },
  { id: 'partnership', title: 'Partnership',                  illustration: 'Partnership',        tooltip: 'A business with 2+ partners (not an LLC)' },
  { id: 'corporation', title: 'Corporation',                  illustration: 'Corporation',        tooltip: 'Registered C-corp or S-corp' },
  { id: 'trust',       title: 'Trust or Estate',              illustration: 'Trust or Estate',    tooltip: 'Operating as a trust or estate' },
  { id: 'other',       title: 'Other',                        illustration: 'Other',              tooltip: "None of the above — I'll describe my entity type" },
];

const ENTITY_META = {
  sole_prop:    { heading: 'Individual / Sole Proprietor', sub: 'You work independently — the business and you are one and the same for tax purposes.' },
  single_llc:   { heading: 'Single-Member LLC',            sub: 'Your LLC is owned entirely by you. Tell us how the IRS treats it for tax filing.' },
  multi_llc:    { heading: 'Multi-Member LLC',             sub: 'Your LLC has more than one owner. We\'ll need your EIN and a few extra details.' },
  partnership:  { heading: 'Partnership',                  sub: 'Two or more people share ownership of the business outside of an LLC structure.' },
  corporation:  { heading: 'Corporation',                  sub: 'A formally incorporated business — C-corp or S-corp elected with the IRS.' },
  trust:        { heading: 'Trust or Estate',              sub: 'The appraisal business is operated through a legal trust or estate.' },
  other:        { heading: 'Other Entity',                 sub: 'Your structure doesn\'t fit the standard categories — describe it below.' },
};

const CompactCard = ({ id, title, illustration, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(id)}
    className="flex flex-col items-center pt-4 pb-3 px-2 border-2 border-slate-200 rounded-exos bg-white hover:border-blue-300 hover:shadow-card transition-all duration-150 focus:outline-none w-full"
  >
    <div className="w-full mb-2">
      <ExosIllustration name={illustration} size={72} className="w-full h-auto" />
    </div>
    <h3 className="font-semibold text-xs text-center leading-snug text-slate-700">{title}</h3>
  </button>
);

const SelectionCard = ({ id, title, illustration, tooltip, onSelect }) => {
  const [showTip, setShowTip] = useState(false);
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="relative flex flex-col items-center pt-8 pb-5 px-3 border-2 border-slate-200 rounded-exos bg-white hover:border-blue-300 hover:shadow-card transition-all duration-150 focus:outline-none w-40"
    >
      <div
        className="absolute top-3 right-3"
        onMouseEnter={() => setShowTip(true)}
        onMouseLeave={() => setShowTip(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <Info className="w-4 h-4 text-slate-300" />
        {showTip && (
          <div className="absolute right-0 top-6 w-48 p-2.5 bg-slate-900 text-white text-xs rounded-exos shadow-xl z-20 leading-relaxed">
            {tooltip}
          </div>
        )}
      </div>
      <div className="w-full mb-5">
        <ExosIllustration name={illustration} size={128} className="w-full h-auto" />
      </div>
      <h3 className="font-semibold text-sm text-center leading-snug text-slate-800">{title}</h3>
    </button>
  );
};

const W9Form = ({ state, setState, onNext, onBack }) => {
  const [hasBusinessName, setHasBusinessName] = useState(
    state.businessStructure === 'sole_prop' ? (state.w9Data.businessName ? true : null) : null
  );
  const [showForeignInfo, setShowForeignInfo] = useState(false);

  const update = (field, value) =>
    setState((prev) => ({ ...prev, w9Data: { ...prev.w9Data, [field]: value } }));

  const setStructure = (id) => {
    setHasBusinessName(null);
    setShowForeignInfo(false);
    setState((prev) => ({
      ...prev,
      businessStructure: id,
      w9Data: {
        businessName: '',
        taxClassification: '',
        foreignMembers: null,
        taxId: '',
        taxIdType: '',
        entityDescription: '',
        minorityOwned: null,
        mailingAddress: prev.w9Data.mailingAddress,
      },
    }));
  };

  const bs = state.businessStructure;
  const taxIdFilled = state.w9Data.taxId.replace(/\D/g, '').length >= 9;

  const isEntityValid = () => {
    if (!bs) return false;
    const { businessName, taxClassification, foreignMembers, taxIdType } = state.w9Data;
    switch (bs) {
      case 'sole_prop': {
        const nameOk = hasBusinessName === false || (hasBusinessName === true && !!businessName);
        return hasBusinessName !== null && nameOk && !!taxIdType && taxIdFilled;
      }
      case 'single_llc': {
        if (!businessName || !taxClassification) return false;
        const isCorpTaxed = ['c_corp', 's_corp'].includes(taxClassification);
        return isCorpTaxed ? taxIdFilled : !!taxIdType && taxIdFilled;
      }
      case 'multi_llc':
        return !!businessName && !!taxClassification && foreignMembers !== null && taxIdFilled && state.w9Data.minorityOwned !== null;
      case 'partnership':
        return !!businessName && foreignMembers !== null && taxIdFilled && state.w9Data.minorityOwned !== null;
      case 'corporation':
        return !!businessName && !!taxClassification && taxIdFilled && state.w9Data.minorityOwned !== null;
      case 'trust':
        return !!businessName && taxIdFilled;
      case 'other':
        return !!state.w9Data.entityDescription && !!businessName && !!taxIdType && taxIdFilled;
      default: return false;
    }
  };

  const mailingValid = () => {
    const m = state.w9Data.mailingAddress;
    return m.useOfficeAddress || (m.street && m.city && m.state && m.zip);
  };

  const isValid = () => !!bs && isEntityValid() && mailingValid();

  // ── Shared render helpers ──

  const radioCard = (selected) =>
    `flex items-start gap-3 p-4 border-2 rounded-exos cursor-pointer transition-all ${
      selected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
    }`;

  const infoBox = (text) => (
    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-exos-sm text-sm text-blue-900 flex gap-2">
      <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
      <span>{text}</span>
    </div>
  );

  const divider = () => <div className="border-t border-slate-100" />;

  const nameField = (label, placeholder, hint) => (
    <div>
      <label className="block text-sm font-normal text-slate-700 mb-1.5">{label}</label>
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}
      <input type="text" placeholder={placeholder}
        value={state.w9Data.businessName}
        onChange={(e) => update('businessName', e.target.value)}
        className="w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  const einField = (hint) => (
    <div>
      <label className="block text-sm font-normal text-slate-700 mb-1.5">Employer ID Number (EIN)</label>
      {hint && <p className="text-xs text-slate-400 mb-2">{hint}</p>}
      <input type="text" inputMode="numeric" placeholder="12-3456789"
        value={state.w9Data.taxId}
        onChange={(e) => { update('taxId', formatEIN(e.target.value)); update('taxIdType', 'ein'); }}
        className="w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        maxLength={10} />
      <p className="text-xs text-slate-400 mt-1.5">Format: XX-XXXXXXX</p>
    </div>
  );

  const taxIdChoice = (hint) => (
    <div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">Tax Identification Number</h3>
      <p className="text-sm text-slate-500 mb-4">
        {hint || 'Use your SSN unless you specifically got an EIN from the IRS for your business.'}
      </p>
      <div className="space-y-3">
        {[
          { type: 'ssn', label: 'Social Security Number (SSN)', placeholder: '123-45-6789', maxLen: 11 },
          { type: 'ein', label: 'Employer ID Number (EIN)',      placeholder: '12-3456789',  maxLen: 10 },
        ].map(({ type, label, placeholder, maxLen }) => (
          <label key={type} className={radioCard(state.w9Data.taxIdType === type)}>
            <input type="radio" name="taxIdType" value={type}
              checked={state.w9Data.taxIdType === type}
              onChange={() => { update('taxIdType', type); update('taxId', ''); }}
              className="mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm text-slate-900 block mb-2">{label}</span>
              {state.w9Data.taxIdType === type && (
                <input type="text" inputMode="numeric" placeholder={placeholder}
                  value={state.w9Data.taxId}
                  onChange={(e) => update('taxId', type === 'ssn' ? formatSSN(e.target.value) : formatEIN(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="w-full border border-slate-200 rounded-exos py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  maxLength={maxLen} />
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );

  const foreignMembers = (memberType) => (
    <div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        Do any {memberType} live outside the U.S.?
      </h3>
      <button type="button" onClick={() => setShowForeignInfo(!showForeignInfo)}
        className="flex items-center gap-1 text-blue-600 text-sm mb-4 hover:text-blue-700">
        Why does this matter?
        <ChevronDown className={`w-4 h-4 transition-transform ${showForeignInfo ? 'rotate-180' : ''}`} />
      </button>
      {showForeignInfo && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-exos-sm text-sm text-slate-700">
          Foreign {memberType} trigger additional IRS withholding requirements under IRC Section 1446(f).
        </div>
      )}
      <div className="space-y-3">
        {[
          { value: false, label: `No — all ${memberType} are U.S. residents` },
          { value: true,  label: `Yes — we have foreign ${memberType}` },
        ].map(({ value, label }) => (
          <label key={String(value)} className={radioCard(state.w9Data.foreignMembers === value)}>
            <input type="radio" name="foreign"
              checked={state.w9Data.foreignMembers === value}
              onChange={() => update('foreignMembers', value)} />
            <span className="text-sm text-slate-900">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  // ── Entity-specific sections ──

  const renderEntityFields = () => {
    switch (bs) {

      case 'sole_prop':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">Do you operate under a business name?</h3>
              <p className="text-sm text-slate-500 mb-4">This is optional for sole proprietors.</p>
              <div className="space-y-3">
                <label className={radioCard(hasBusinessName === false)}>
                  <input type="radio" name="hn" checked={hasBusinessName === false}
                    onChange={() => { setHasBusinessName(false); update('businessName', ''); }} />
                  <span className="text-sm text-slate-900">No — operating as an individual</span>
                </label>
                <label className={radioCard(hasBusinessName === true)}>
                  <input type="radio" name="hn" checked={hasBusinessName === true}
                    onChange={() => setHasBusinessName(true)} className="mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm text-slate-900 block mb-2">Yes, I have a business name</span>
                    {hasBusinessName === true && (
                      <input type="text" placeholder="Smith Appraisal Services"
                        value={state.w9Data.businessName || ''}
                        onChange={(e) => update('businessName', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                        className="w-full border border-slate-200 rounded-exos py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                    )}
                  </div>
                </label>
              </div>
            </div>
            {divider()}
            {taxIdChoice()}
          </div>
        );

      case 'single_llc': {
        const isCorpTaxed = ['c_corp', 's_corp'].includes(state.w9Data.taxClassification);
        return (
          <div className="space-y-8">
            {nameField('LLC Legal Name', '"Smith Appraisal LLC"', "As registered with your state's Secretary of State.")}
            {divider()}
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">How is your LLC taxed?</h3>
              <p className="text-sm text-slate-500 mb-4">Most single-member LLCs are "disregarded entities."</p>
              <div className="space-y-3">
                {[
                  { value: 'disregarded', label: 'Disregarded entity (most common)', tip: "Didn't file Form 8832 or 2553. The IRS taxes you personally, not the LLC." },
                  { value: 'c_corp',      label: 'C Corporation',                    tip: 'Filed Form 8832 to be taxed as a C-corp.' },
                  { value: 's_corp',      label: 'S Corporation',                    tip: 'Filed Form 2553 to be taxed as an S-corp.' },
                ].map(({ value, label, tip }) => (
                  <label key={value} className={radioCard(state.w9Data.taxClassification === value)}>
                    <input type="radio" name="taxClass" value={value}
                      checked={state.w9Data.taxClassification === value}
                      onChange={() => {
                        update('taxClassification', value);
                        update('taxId', '');
                        update('taxIdType', value === 'disregarded' ? '' : 'ein');
                      }} />
                    <span className="flex-1 text-sm text-slate-900">{label}</span>
                    <InfoTooltip text={tip} />
                  </label>
                ))}
                {infoBox("Not sure? If you didn't file special tax forms, choose Disregarded entity.")}
              </div>
            </div>
            {state.w9Data.taxClassification && (
              <>
                {divider()}
                {isCorpTaxed
                  ? einField('LLCs taxed as corporations must use an EIN.')
                  : taxIdChoice('Use your SSN unless you have a separate EIN for the LLC.')}
              </>
            )}
          </div>
        );
      }

      case 'multi_llc':
        return (
          <div className="space-y-8">
            {nameField('LLC Legal Name', '"Smith & Jones Appraisal LLC"', 'As registered with your state.')}
            {divider()}
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">How is your LLC taxed?</h3>
              <p className="text-sm text-slate-500 mb-4">Most multi-member LLCs are taxed as partnerships.</p>
              <div className="space-y-3">
                {[
                  { value: 'partnership', label: 'Partnership (most common)', tip: "Default tax treatment for multi-member LLCs. Didn't file Form 8832 or 2553." },
                  { value: 'c_corp',      label: 'C Corporation',             tip: 'Filed Form 8832 to be taxed as a C-corp.' },
                  { value: 's_corp',      label: 'S Corporation',             tip: 'Filed Form 2553 to be taxed as an S-corp.' },
                ].map(({ value, label, tip }) => (
                  <label key={value} className={radioCard(state.w9Data.taxClassification === value)}>
                    <input type="radio" name="taxClass" value={value}
                      checked={state.w9Data.taxClassification === value}
                      onChange={() => update('taxClassification', value)} />
                    <span className="flex-1 text-sm text-slate-900">{label}</span>
                    <InfoTooltip text={tip} />
                  </label>
                ))}
                {infoBox("Not sure? If you didn't file Form 8832 or 2553, choose Partnership.")}
              </div>
            </div>
            {divider()}
            {foreignMembers('LLC members')}
            {divider()}
            {einField('All multi-member LLCs must have an EIN.')}
          </div>
        );

      case 'partnership':
        return (
          <div className="space-y-8">
            {nameField('Partnership Legal Name', '"Smith & Jones Appraisal Partners"', 'As registered with your state or county.')}
            {divider()}
            {foreignMembers('partners')}
            {divider()}
            {einField('All partnerships must have an EIN.')}
          </div>
        );

      case 'corporation':
        return (
          <div className="space-y-8">
            {nameField('Corporation Legal Name', '"Smith Appraisal Inc."', "As registered with your state's Secretary of State.")}
            {divider()}
            <div>
              <h3 className="text-base font-semibold text-slate-900 mb-1">What type of corporation are you?</h3>
              <p className="text-sm text-slate-500 mb-4">Determined by your IRS election or default status.</p>
              <div className="space-y-3">
                {[
                  { value: 'c_corp', label: 'C Corporation', tip: 'Default corporate tax treatment. Profits taxed at the corporate level, then dividends taxed at the shareholder level.' },
                  { value: 's_corp', label: 'S Corporation', tip: 'Filed Form 2553. Income passes through to shareholders, avoiding double taxation.' },
                ].map(({ value, label, tip }) => (
                  <label key={value} className={radioCard(state.w9Data.taxClassification === value)}>
                    <input type="radio" name="corpType" value={value}
                      checked={state.w9Data.taxClassification === value}
                      onChange={() => { update('taxClassification', value); update('taxIdType', 'ein'); }} />
                    <span className="flex-1 text-sm text-slate-900">{label}</span>
                    <InfoTooltip text={tip} />
                  </label>
                ))}
              </div>
            </div>
            {divider()}
            {einField('All corporations are required to provide an EIN.')}
          </div>
        );

      case 'trust':
        return (
          <div className="space-y-8">
            {nameField('Trust or Estate Legal Name', '"The John Smith Living Trust"', 'As registered with the IRS or probate court.')}
            {einField('Trusts and estates must provide an EIN, not a personal SSN.')}
          </div>
        );

      case 'other':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-normal text-slate-700 mb-1.5">Entity Type</label>
              <p className="text-xs text-slate-400 mb-2">Describe how your business is structured.</p>
              <input type="text" placeholder="e.g., Joint Venture, Cooperative, Government Entity"
                value={state.w9Data.entityDescription || ''}
                onChange={(e) => update('entityDescription', e.target.value)}
                className="w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {nameField('Entity Legal Name', '"Smith Appraisal Ventures"', null)}
            {taxIdChoice()}
          </div>
        );

      default: return null;
    }
  };

  const remainingStructures = STRUCTURES.filter((s) => s.id !== bs);
  const currentStructure = STRUCTURES.find((s) => s.id === bs);

  return (
    <>
      <style>{`
        @keyframes w9CardExpand {
          from { clip-path: inset(0 0 87% 0 round 10px); opacity: 0.6; }
          40%  { opacity: 1; }
          to   { clip-path: inset(0 0 0% 0 round 10px); opacity: 1; }
        }

        @keyframes w9FieldsFade {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-exos shadow-sm border border-slate-100 p-6">

          <div className="mb-8">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 3 of 6 · W-9</p>
            <h1 className="text-2xl font-bold text-slate-900">Business Structure & Tax Info</h1>
          </div>

          {/* ── No selection: all 7 cards ── */}
          {!bs && (
            <div>
              <h2 className="text-base font-semibold text-slate-900 mb-1">How is your appraisal business set up?</h2>
              <p className="text-sm text-slate-500 mb-5">Select the option that best describes your legal structure.</p>
              <div className="flex flex-wrap gap-3 justify-center">
                {STRUCTURES.map(({ id, title, illustration, tooltip }) => (
                  <SelectionCard key={id} id={id} title={title} illustration={illustration}
                    tooltip={tooltip} onSelect={setStructure} />
                ))}
              </div>
            </div>
          )}

          {/* ── Card selected: expanded card + entity fields + remaining grid ── */}
          {bs && (
            <div>
              {/* Expanded card */}
              <div
                className="border-2 border-exos-border-light rounded-exos p-6 mb-4"
                style={{ animation: 'w9CardExpand 0.32s ease-out both' }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="flex-shrink-0">
                      <ExosIllustration name={currentStructure.illustration} size={80} />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-slate-900 leading-tight">
                        {ENTITY_META[bs].heading}
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">{ENTITY_META[bs].sub}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStructure(null)}
                    className="flex-shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 rounded-exos-sm px-3 py-1.5 transition-colors"
                  >
                    Change
                  </button>
                </div>

                <div className="border-t border-slate-100 mb-6" />

                {/* Entity fields */}
                <div style={{ animation: 'w9FieldsFade 0.28s ease-out 0.1s both' }}>
                  <div className="space-y-8">
                    {renderEntityFields()}

                    <div className="border-t border-slate-100" />

                    <MailingAddressQuestion
                      basicInfo={state.basicInfo}
                      w9Data={state.w9Data}
                      onChange={update}
                    />

                    {['multi_llc', 'partnership', 'corporation'].includes(bs) && (
                      <>
                        <div className="border-t border-slate-100" />
                        <div>
                          <h3 className="text-base font-semibold text-slate-900 mb-1">
                            Is your business at least 51% owned by one or more individuals from a minority group?
                          </h3>
                          <p className="text-sm text-slate-500 mb-4">
                            This information is used for supplier diversity tracking and has no effect on your application.
                          </p>
                          <div className="space-y-3">
                            {[
                              { value: true,  label: 'Yes — our business qualifies' },
                              { value: false, label: 'No — it does not' },
                            ].map(({ value, label }) => (
                              <label key={String(value)} className={radioCard(state.w9Data.minorityOwned === value)}>
                                <input type="radio" name="minorityOwned"
                                  checked={state.w9Data.minorityOwned === value}
                                  onChange={() => update('minorityOwned', value)} />
                                <span className="text-sm text-slate-900">{label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Remaining cards in 3-col grid */}
              <div>
                <h3 className="text-xs text-slate-400 font-medium mb-2 mt-1">Or choose a different structure</h3>
                <div className="grid grid-cols-3 gap-2.5">
                  {remainingStructures.map(({ id, title, illustration }) => (
                    <CompactCard key={id} id={id} title={title} illustration={illustration} onSelect={setStructure} />
                  ))}
                </div>
              </div>
            </div>
          )}

          <NavFooter onBack={onBack} onContinue={onNext} continueLabel="Review W-9" continueDisabled={!isValid()} />
        </div>
      </div>
    </>
  );
};

export default W9Form;
