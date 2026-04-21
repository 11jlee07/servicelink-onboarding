import React, { useState, useRef } from 'react';
import { ChevronDown, Upload, FileText } from 'lucide-react';
import NavFooter from './shared/NavFooter';

const Accordion = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-exos overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
      >
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 py-5 space-y-6">{children}</div>}
    </div>
  );
};

const radioCard = (selected) =>
  `flex items-center gap-3 p-4 border-2 rounded-exos cursor-pointer transition-all flex-1 ${
    selected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
  }`;

const YesNo = ({ value, onChange, name }) => (
  <div className="flex gap-3">
    {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
      <label key={String(v)} className={radioCard(value === v)}>
        <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} />
        <span className="text-sm text-slate-900">{l}</span>
      </label>
    ))}
  </div>
);

const BackgroundCheck = ({ state, setState, onNext, onBack }) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [reo, setReo] = useState(null);
  const [lawsuit, setLawsuit] = useState(null);
  const [lawsuitWith, setLawsuitWith] = useState('');
  const [lawsuitDesc, setLawsuitDesc] = useState('');
  const [lawsuitDoc, setLawsuitDoc] = useState(null);
  const [greenTraining, setGreenTraining] = useState(null);
  const [greenDesc, setGreenDesc] = useState('');
  const [highDollar, setHighDollar] = useState(null);
  const fileRef = useRef(null);

  const qualificationsValid =
    reo !== null &&
    lawsuit !== null &&
    (lawsuit === false || (lawsuitWith.trim() && lawsuitDesc.trim())) &&
    greenTraining !== null &&
    (greenTraining === false || greenDesc.trim()) &&
    highDollar !== null;

  const isValid = qualificationsValid && acknowledged;

  const handleContinue = () => {
    setState?.((prev) => ({
      ...prev,
      backgroundCheck: { reo, lawsuit, lawsuitWith, lawsuitDesc, lawsuitDoc, greenTraining, greenDesc, highDollar },
    }));
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-exos shadow-sm border border-slate-100 p-6">
        <div className="mb-6">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 5 of 6</p>
          <h1 className="text-2xl font-bold text-slate-900">Background & Qualifications</h1>
        </div>

        <div className="space-y-4 mb-6">

          {/* Qualifications */}
          <Accordion title="Qualifications">

            <div>
              <p className="text-sm font-medium text-slate-900 mb-3">Do you provide appraisals for REO?</p>
              <YesNo value={reo} onChange={setReo} name="reo" />
            </div>

            <div className="border-t border-slate-100 pt-6">
              <p className="text-sm font-medium text-slate-900 mb-3">Have you been involved in any lawsuits or disciplinary action?</p>
              <YesNo value={lawsuit} onChange={setLawsuit} name="lawsuit" />
              {lawsuit === true && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1.5">With whom were you involved?</label>
                    <input
                      type="text"
                      value={lawsuitWith}
                      onChange={(e) => setLawsuitWith(e.target.value)}
                      className="w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1.5">Describe the circumstances</label>
                    <textarea
                      value={lawsuitDesc}
                      onChange={(e) => setLawsuitDesc(e.target.value)}
                      rows={4}
                      className="w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1.5">
                      Supporting documentation <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input ref={fileRef} type="file" className="hidden" onChange={(e) => setLawsuitDoc(e.target.files[0])} />
                    {lawsuitDoc ? (
                      <div className="flex items-center gap-3 p-3 border border-slate-200 bg-slate-50 rounded-exos">
                        <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <span className="text-sm text-slate-700 truncate flex-1">{lawsuitDoc.name}</span>
                        <button type="button" onClick={() => setLawsuitDoc(null)}
                          className="text-xs text-slate-400 hover:text-red-500 transition-colors">Remove</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-exos text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload document
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6">
              <p className="text-sm font-medium text-slate-900 mb-3">Do you have special training to complete "green" appraisals?</p>
              <YesNo value={greenTraining} onChange={setGreenTraining} name="green" />
              {greenTraining === true && (
                <div className="mt-4">
                  <label className="block text-sm text-slate-700 mb-1.5">Please explain</label>
                  <textarea
                    value={greenDesc}
                    onChange={(e) => setGreenDesc(e.target.value)}
                    rows={3}
                    className="w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 pt-6">
              <p className="text-sm font-medium text-slate-900 mb-3">Do you have interest in joining our high-dollar value panel?</p>
              <YesNo value={highDollar} onChange={setHighDollar} name="highdollar" />
            </div>

          </Accordion>

          {/* Background Check */}
          <Accordion title="Background Check">
            <div className="text-sm text-slate-700 leading-relaxed space-y-3">
              <p>
                ServiceLink's policy is that all Independent Contract vendors are to be background
                checked as a pre-requisite to being added and retained as a member of its panel of
                independent contractors.
              </p>
              <p>
                This policy also supports our Lender/Client contracts that require ServiceLink to
                obtain a clear background check from each Independent Contract vendor.
              </p>
              <p>
                Shortly, you will be receiving a unique link to complete ServiceLink's required
                background check through <strong>CrimCheck</strong>. The link you will be receiving
                is <strong>pre-paid by ServiceLink</strong>, in accordance with{' '}
                <em>22 Tex. Admin. Code § 159.201(a)(19)</em>.
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600 pl-1">
                <li>Background check search will cover a minimum of 10 years</li>
                <li>The only acceptable background check company is CrimCheck*</li>
              </ul>
              <p>
                If you have any questions or do not receive the link to process shortly, please
                contact ServiceLink's Strategic Business Department at{' '}
                <a href="mailto:Appraiserbackgroundchecks@svclink.com" className="text-blue-600 hover:underline">
                  Appraiserbackgroundchecks@svclink.com
                </a>
              </p>
              <p className="text-xs text-slate-400 italic pt-1">
                *ServiceLink has confirmed that CrimCheck is a reputable, independent and qualified
                background check vendor. Neither SL nor FNF have any ownership interest in the
                vendor, nor do they receive any fee "split", referral fee or other compensation from
                the vendor or its fees.
              </p>
            </div>

            <div className={`p-4 border-2 rounded-exos transition-all ${acknowledged ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 w-4 h-4 flex-shrink-0"
                />
                <span className="text-sm text-slate-700">
                  I understand that a background check through <strong>CrimCheck</strong> is required
                  to complete my onboarding, and that I will receive a pre-paid link via email shortly
                  after submission.
                </span>
              </label>
            </div>
          </Accordion>

        </div>

        <NavFooter onBack={onBack} onContinue={handleContinue} continueDisabled={!isValid} />
      </div>
    </div>
  );
};

export default BackgroundCheck;
