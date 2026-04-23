import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, X, Zap, CheckCircle, CreditCard, ArrowRight, ScanSearch, Sparkles } from 'lucide-react';
import NavFooter from './shared/NavFooter';
import { formatPhone } from '../utils/validation';
import { formatSSN } from '../utils/validation';
import { parseEOInsurance } from '../utils/mockApi';

const EO_FIELDS = [
  { key: 'underwriter',      label: 'Underwriter (Company)',  placeholder: 'e.g. Berkley One Insurance',  type: 'text' },
  { key: 'policyNumber',     label: 'Binder / Policy #',      placeholder: 'e.g. EO-2024-884421-TX',     type: 'text' },
  { key: 'limitOfLiability', label: 'Limit of Liability',     placeholder: 'e.g. 1,000,000',             type: 'text' },
  { key: 'effectiveDate',    label: 'Effective Date',         placeholder: '',                            type: 'date' },
  { key: 'expirationDate',   label: 'Expiration Date',        placeholder: '',                            type: 'date' },
];
const EO_EMPTY = { underwriter: '', policyNumber: '', limitOfLiability: '', effectiveDate: '', expirationDate: '' };
const FIELD_DELAY = [0, 120, 240, 360, 480];

// ── TVA content ──────────────────────────────────────────────────────────────

const TVA_SECTIONS = [
  { title: '1. SERVICES', body: "Vendor agrees to provide residential and/or commercial appraisal services in accordance with ServiceLink's standards and requirements. All appraisals must comply with USPAP and all applicable state and federal regulations." },
  { title: '2. PAYMENT TERMS', body: 'ServiceLink shall pay Vendor the agreed-upon fees for completed and accepted assignments within thirty (30) days of receiving a completed appraisal report.' },
  { title: '3. CONFIDENTIALITY', body: 'Vendor agrees to maintain strict confidentiality of all client information, property data, loan data, and ServiceLink business information obtained during this engagement. This obligation survives termination.' },
  { title: '4. INDEPENDENT CONTRACTOR STATUS', body: 'Vendor is an independent contractor and not an employee, agent, partner, or joint venturer of ServiceLink. Vendor is solely responsible for all taxes, insurance premiums, and other obligations.' },
  { title: '5. LICENSE & COMPLIANCE', body: 'Vendor warrants that they maintain all necessary licenses, certifications, and E&O insurance required to perform services in each jurisdiction. Vendor agrees to notify ServiceLink immediately of any license change.' },
  { title: '6. QUALITY STANDARDS', body: "All work product must meet ServiceLink's quality standards. ServiceLink reserves the right to reject work or request revisions at no additional cost. Repeated failures may result in termination." },
  { title: '7. TERMINATION', body: 'Either party may terminate with thirty (30) days written notice. ServiceLink may terminate immediately for cause including quality issues, compliance violations, license revocation, fraud, or misconduct.' },
  { title: '8. INDEMNIFICATION', body: "Vendor agrees to indemnify and hold harmless ServiceLink and its affiliates from any claims, damages, or liabilities arising from Vendor's performance, breach of this Agreement, negligence, or misconduct." },
  { title: '9. DISPUTE RESOLUTION', body: 'Disputes shall be resolved through binding arbitration under the American Arbitration Association rules. This Agreement is governed by the laws of the Commonwealth of Pennsylvania.' },
  { title: '10. ENTIRE AGREEMENT', body: 'This Agreement constitutes the entire agreement between the parties and supersedes all prior agreements, representations, and understandings.' },
];

const TVAModal = ({ onClose }) => {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-exos shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '80vh' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">Trade Vendor Agreement</h2>
            <p className="text-xs text-slate-400 mt-0.5">ServiceLink Field Services, LLC · Effective {today}</p>
          </div>
          <button type="button" onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-5 flex-1">
          {TVA_SECTIONS.map(({ title, body }) => (
            <div key={title} className="mb-5">
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">{title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
            </div>
          ))}
          <p className="text-xs text-slate-400 italic mt-2">[End of Trade Vendor Agreement]</p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold uppercase rounded-exos transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Checkr modal ─────────────────────────────────────────────────────────────

const CheckrModal = ({ prefill, onComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState({
    firstName: prefill.firstName || '',
    lastName:  prefill.lastName  || '',
    ssn:       prefill.ssn       || '',
    dob:       '',
    zip:       prefill.zip       || '',
    email:     prefill.email     || '',
    phone:     prefill.phone     || '',
  });
  const [fcraConsent, setFcraConsent] = useState(false);
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [submitting, setSubmitting] = useState(false);

  const infoValid =
    info.firstName && info.lastName && info.ssn.replace(/\D/g,'').length === 9 &&
    info.dob && info.zip.length === 5 && info.email && info.phone && fcraConsent;

  const cardValid =
    card.number.replace(/\s/g,'').length === 16 &&
    card.expiry.length === 5 && card.cvv.length >= 3 && card.name;

  const formatCard = (v) => v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g,'').slice(0,4);
    return d.length > 2 ? d.slice(0,2) + '/' + d.slice(2) : d;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    onComplete();
  };

  const inputCls = 'w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-white rounded-exos shadow-2xl w-full max-w-lg flex flex-col" style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-exos flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">Instant Background Check</p>
              <p className="text-xs text-slate-400">Powered by Checkr · Step {step} of 2</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-0.5">Confirm your information</p>
                <p className="text-xs text-slate-400">We've pre-filled what we have. Review and update anything that looks off.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">First Name</label>
                  <input className={inputCls} value={info.firstName} onChange={e => setInfo(p => ({...p, firstName: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Last Name</label>
                  <input className={inputCls} value={info.lastName} onChange={e => setInfo(p => ({...p, lastName: e.target.value}))} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Social Security Number</label>
                <input className={inputCls} placeholder="123-45-6789" value={info.ssn}
                  onChange={e => setInfo(p => ({...p, ssn: formatSSN(e.target.value)}))} maxLength={11} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Date of Birth</label>
                  <input className={inputCls} type="date" value={info.dob}
                    onChange={e => setInfo(p => ({...p, dob: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Current ZIP Code</label>
                  <input className={inputCls} placeholder="75009" value={info.zip} maxLength={5}
                    onChange={e => setInfo(p => ({...p, zip: e.target.value.replace(/\D/g,'').slice(0,5)}))} />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Email</label>
                <input className={inputCls} type="email" value={info.email}
                  onChange={e => setInfo(p => ({...p, email: e.target.value}))} />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Phone</label>
                <input className={inputCls} type="tel" placeholder="(555) 000-0000" value={info.phone}
                  onChange={e => setInfo(p => ({...p, phone: formatPhone(e.target.value)}))} />
              </div>

              {/* FCRA disclosure */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-exos text-xs text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-700 mb-1">Consumer Report Disclosure (FCRA)</p>
                <p>A consumer report (background check) will be obtained from <strong>Checkr, Inc.</strong>, a consumer reporting agency, for the purpose of evaluating you for an independent contractor engagement. This report may include criminal records, identity verification, and other public records. You have the right to request a free copy of this report and to dispute its accuracy by contacting Checkr at <strong>checkr.com/candidate</strong>.</p>
              </div>

              <label className={`flex items-start gap-3 p-3.5 border-2 rounded-exos cursor-pointer transition-all ${fcraConsent ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                <input type="checkbox" checked={fcraConsent} onChange={e => setFcraConsent(e.target.checked)} className="mt-0.5 w-4 h-4 flex-shrink-0" />
                <span className="text-xs text-slate-700">
                  I authorize ServiceLink to obtain a consumer report from Checkr, Inc. for contractor evaluation purposes. I have read and understand the disclosure above.
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-0.5">Payment</p>
                <p className="text-xs text-slate-400">One-time fee for your background check. Securely processed — ServiceLink does not store card details.</p>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-exos">
                <span className="text-sm text-slate-700">Instant background check · Checkr</span>
                <span className="text-sm font-bold text-slate-900">$29.99</span>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Name on Card</label>
                <input className={inputCls} placeholder="Jane Smith" value={card.name}
                  onChange={e => setCard(p => ({...p, name: e.target.value}))} />
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Card Number</label>
                <div className="relative">
                  <input className={inputCls + ' pr-10'} placeholder="1234 5678 9012 3456"
                    value={card.number} onChange={e => setCard(p => ({...p, number: formatCard(e.target.value)}))} maxLength={19} />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Expiry</label>
                  <input className={inputCls} placeholder="MM/YY"
                    value={card.expiry} onChange={e => setCard(p => ({...p, expiry: formatExpiry(e.target.value)}))} maxLength={5} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">CVV</label>
                  <input className={inputCls} placeholder="123"
                    value={card.cvv} onChange={e => setCard(p => ({...p, cvv: e.target.value.replace(/\D/g,'').slice(0,4)}))} maxLength={4} />
                </div>
              </div>

              <p className="text-xs text-slate-400">🔒 Payments processed securely. ServiceLink does not store your card information.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
          {step === 1 ? (
            <button type="button" disabled={!infoValid} onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-bold uppercase rounded-exos transition-colors">
              Continue to Payment <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="space-y-2">
              <button type="button" disabled={!cardValid || submitting} onClick={handleSubmit}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-bold uppercase rounded-exos transition-colors">
                {submitting ? 'Processing…' : 'Pay $29.99 & Run Check'}
              </button>
              <button type="button" onClick={() => setStep(1)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Shared helpers ────────────────────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

const BackgroundCheck = ({ state, setState, onNext, onBack }) => {
  /* ── E&O state ── */
  const [eoFile,       setEoFile]       = useState(state.eoInsurance?.uploadedFile || null);
  const [eoParseState, setEoParseState] = useState(state.eoInsurance?.parsed ? 'extracted' : 'idle');
  const [eoFields,     setEoFields]     = useState(state.eoInsurance?.fields || EO_EMPTY);
  const [eoVisible,    setEoVisible]    = useState(state.eoInsurance?.parsed ? EO_FIELDS.map(f => f.key) : []);
  const eoFileRef = useRef(null);

  const handleEOFile = async (f) => {
    if (!f) return;
    setEoFile(f);
    setEoParseState('parsing');
    setEoVisible([]);
    setEoFields(EO_EMPTY);
    try {
      const result = await parseEOInsurance(f);
      setEoFields(result);
      setEoParseState('extracted');
      EO_FIELDS.forEach((field, i) => {
        setTimeout(() => setEoVisible((prev) => [...prev, field.key]), FIELD_DELAY[i]);
      });
    } catch {
      setEoParseState('idle');
    }
  };

  const removeEO = () => {
    setEoFile(null);
    setEoParseState('idle');
    setEoFields(EO_EMPTY);
    setEoVisible([]);
    setState((prev) => ({ ...prev, eoInsurance: { uploadedFile: null } }));
  };

  const formatSize = (bytes) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const eoAllFilled = EO_FIELDS.every((f) => eoFields[f.key]);

  /* ── Screening state ── */
  const [lawsuit, setLawsuit] = useState(null);
  const [lawsuitWith, setLawsuitWith] = useState('');
  const [lawsuitDesc, setLawsuitDesc] = useState('');
  const [lawsuitDoc, setLawsuitDoc] = useState(null);
  const [tvaAgreed, setTvaAgreed] = useState(false);
  const [showTVA, setShowTVA] = useState(false);
  const [bgOption, setBgOption] = useState(null); // 'checkr' | 'own'
  const [showCheckr, setShowCheckr] = useState(false);
  const [checkrDone, setCheckrDone] = useState(false);
  const [ownFile, setOwnFile] = useState(null);
  const [ownScanState, setOwnScanState] = useState(null); // null | 'scanning' | 'scanned'
  const [ownAcknowledged, setOwnAcknowledged] = useState(false);
  const fileRef = useRef(null);
  const bgFileRef = useRef(null);

  useEffect(() => {
    if (ownScanState === 'scanning') {
      const t = setTimeout(() => setOwnScanState('scanned'), 2200);
      return () => clearTimeout(t);
    }
  }, [ownScanState]);

  const bgComplete = checkrDone || (!!ownFile && ownAcknowledged);

  const isValid =
    eoParseState === 'extracted' && eoAllFilled &&
    lawsuit !== null &&
    (lawsuit === false || (lawsuitWith.trim() && lawsuitDesc.trim())) &&
    tvaAgreed &&
    bgComplete;

  const handleContinue = () => {
    setState?.((prev) => ({
      ...prev,
      eoInsurance: { uploadedFile: eoFile, fields: eoFields, parsed: true },
      tva: { agreed: true, agreedAt: new Date().toISOString() },
      backgroundCheck: { lawsuit, lawsuitWith, lawsuitDesc, lawsuitDoc, bgOption, checkrDone, ownFile, ownAcknowledged },
    }));
    onNext();
  };

  const prefill = {
    firstName: state.basicInfo?.firstName || '',
    lastName:  state.basicInfo?.lastName  || '',
    ssn:       state.w9Data?.taxIdType === 'ssn' ? state.w9Data?.taxId || '' : '',
    zip:       state.basicInfo?.address?.zip || '',
    email:     state.accountData?.email || '',
    phone:     state.basicInfo?.phone || '',
  };

  return (
    <>
      {showTVA && <TVAModal onClose={() => setShowTVA(false)} />}
      {showCheckr && (
        <CheckrModal
          prefill={prefill}
          onComplete={() => { setCheckrDone(true); setShowCheckr(false); }}
          onClose={() => { setShowCheckr(false); setBgOption(null); }}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-exos shadow-sm border border-slate-100 p-6">
          <div className="mb-6">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 5 of 5 · Screening</p>
            <h1 className="text-2xl font-bold text-slate-900">Screening</h1>
            <p className="text-sm text-slate-500 mt-1">E&amp;O insurance, vendor agreement, and background check.</p>
          </div>

          <div className="space-y-8">

            {/* ── E&O Insurance ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {eoParseState === 'extracted' && eoAllFilled
                  ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  : <FileText className="w-4 h-4 text-slate-300 flex-shrink-0" />
                }
                <h2 className="text-base font-semibold text-slate-900">E&amp;O Insurance</h2>
              </div>
              <p className="text-sm text-slate-500 mb-4">Upload your certificate of insurance. We'll extract the policy details automatically.</p>

              {!eoFile && (
                <div onDrop={(e) => { e.preventDefault(); handleEOFile(e.dataTransfer.files[0]); }}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => eoFileRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-exos p-10 text-center cursor-pointer transition-colors group">
                  <div className="w-14 h-14 bg-slate-100 group-hover:bg-blue-50 rounded-exos flex items-center justify-center mx-auto mb-3 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <p className="text-slate-700 font-medium mb-1">Drop your E&amp;O certificate here or click to browse</p>
                  <p className="text-sm text-slate-400">PDF, JPG, or PNG · Max 10 MB</p>
                  <input ref={eoFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleEOFile(e.target.files[0])} className="hidden" />
                </div>
              )}

              {eoFile && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 border border-slate-200 bg-slate-50 rounded-exos">
                    <div className="w-9 h-9 rounded-exos bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{eoFile.name}</p>
                      <p className="text-xs text-slate-500 truncate">{formatSize(eoFile.size)}{eoParseState === 'parsing' ? ' · Analyzing…' : ''}</p>
                    </div>
                    <button type="button" onClick={removeEO}
                      className="flex-shrink-0 text-xs font-medium text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-exos-sm px-3 py-1.5 transition-colors">
                      Reupload
                    </button>
                  </div>

                  {eoParseState === 'parsing' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Extracting policy details…</p>
                      </div>
                      {EO_FIELDS.map((_, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="h-3 w-28 bg-slate-100 rounded animate-pulse" />
                          <div className="h-10 bg-slate-100 rounded-exos animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                        </div>
                      ))}
                    </div>
                  )}

                  {eoParseState === 'extracted' && (
                    <div className="space-y-4">
                      {EO_FIELDS.map((field) => {
                        const visible = eoVisible.includes(field.key);
                        return (
                          <div key={field.key} style={{
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateY(0)' : 'translateY(6px)',
                            transition: 'opacity 300ms ease, transform 300ms ease',
                          }}>
                            <label className="block text-sm font-normal text-slate-700 mb-1.5">{field.label}</label>
                            <input type={field.type} value={eoFields[field.key]}
                              onChange={(e) => setEoFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                              placeholder={field.placeholder}
                              className="w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-slate-100" />

            {/* Lawsuit question */}
            <div>
              <p className="text-sm font-medium text-slate-900 mb-3">Have you been involved in any lawsuits or disciplinary action?</p>
              <YesNo value={lawsuit} onChange={setLawsuit} name="lawsuit" />
              {lawsuit === true && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-1.5">With whom were you involved?</label>
                    <input type="text" value={lawsuitWith} onChange={(e) => setLawsuitWith(e.target.value)}
                      className="w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-700 mb-1.5">Describe the circumstances</label>
                    <textarea value={lawsuitDesc} onChange={(e) => setLawsuitDesc(e.target.value)} rows={4}
                      className="w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
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

            <div className="border-t border-slate-100" />

            {/* TVA checkbox */}
            <div className={`p-4 border-2 rounded-exos transition-all ${tvaAgreed ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={tvaAgreed} onChange={(e) => setTvaAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 flex-shrink-0" />
                <span className="text-sm text-slate-700">
                  I have read and agree to the{' '}
                  <button type="button" onClick={() => setShowTVA(true)}
                    className="text-blue-600 hover:text-blue-700 underline font-medium">
                    Trade Vendor Agreement
                  </button>
                </span>
              </label>
            </div>

            <div className="border-t border-slate-100" />

            {/* Background check */}
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-1">Background Check</p>
              <p className="text-sm text-slate-500 mb-4">Choose how you'd like to complete your background check.</p>

              {/* Option cards — always visible until a flow is complete */}
              {!checkrDone && !ownFile && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Instant via Checkr */}
                    <button type="button"
                      onClick={() => { setBgOption('checkr'); setShowCheckr(true); }}
                      className={`text-left p-4 border-2 rounded-exos transition-all hover:border-blue-300 hover:shadow-sm ${bgOption === 'checkr' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                      <div className="w-8 h-8 bg-blue-100 rounded-exos flex items-center justify-center mb-3">
                        <Zap className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Instant Background Check</p>
                      <p className="text-xs text-slate-500 leading-relaxed">Results in minutes · Powered by Checkr · $29.99</p>
                    </button>

                    {/* Upload own */}
                    <button type="button"
                      onClick={() => setBgOption(bgOption === 'own' ? null : 'own')}
                      className={`text-left p-4 border-2 rounded-exos transition-all hover:border-blue-300 hover:shadow-sm ${bgOption === 'own' ? 'border-blue-600 bg-blue-50' : 'border-slate-200'}`}>
                      <div className={`w-8 h-8 rounded-exos flex items-center justify-center mb-3 ${bgOption === 'own' ? 'bg-blue-100' : 'bg-slate-100'}`}>
                        <FileText className={`w-4 h-4 ${bgOption === 'own' ? 'text-blue-600' : 'text-slate-500'}`} />
                      </div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">I Have My Own Report</p>
                      <p className="text-xs text-slate-500 leading-relaxed">Upload an existing background check (issued within the last 6 months)</p>
                    </button>
                  </div>

                  {/* Inline upload box — expands when "own" is selected */}
                  {bgOption === 'own' && (
                    <div
                      className="border-2 border-dashed border-slate-300 rounded-exos p-6 flex flex-col items-center gap-3 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all"
                      onClick={() => bgFileRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) { setOwnFile(file); setOwnScanState('scanning'); setOwnAcknowledged(false); }
                      }}
                    >
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                        <Upload className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">Drop your report here or <span className="text-blue-600">browse</span></p>
                        <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, or PNG · Issued within the last 6 months</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <input ref={bgFileRef} type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setOwnFile(e.target.files[0]);
                    setOwnScanState('scanning');
                    setOwnAcknowledged(false);
                  }
                }} />

              {/* Checkr completed */}
              {checkrDone && (
                <div className="flex items-center gap-3 p-4 border border-emerald-200 bg-emerald-50 rounded-exos">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Background check initiated</p>
                    <p className="text-xs text-slate-500">Powered by Checkr · Results typically available within minutes</p>
                  </div>
                </div>
              )}

              {/* Own report: scanning animation */}
              {ownFile && ownScanState === 'scanning' && (
                <div className="p-5 border-2 border-blue-200 bg-blue-50 rounded-exos flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <ScanSearch className="w-6 h-6 text-blue-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Scanning your report…</p>
                    <p className="text-xs text-slate-500 mt-0.5">This only takes a moment</p>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-1 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full w-full" style={{ transformOrigin: 'left', animation: 'growWidth 2.2s ease-in-out forwards' }} />
                  </div>
                  <style>{`@keyframes growWidth { from { transform: scaleX(0); } to { transform: scaleX(1); } }`}</style>
                </div>
              )}

              {/* Own report: scanned — awaiting acknowledgment */}
              {ownFile && ownScanState === 'scanned' && !ownAcknowledged && (
                <div className="space-y-3">
                  <div className="p-4 border border-blue-200 bg-blue-50 rounded-exos">
                    <div className="flex items-start gap-3">
                      <ScanSearch className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">We've scanned your background check report.</p>
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed">We're checking with Sterling to validate — this usually takes just a few minutes. You'll hear from us once it's confirmed.</p>
                        <p className="text-xs text-slate-400 mt-2 truncate">{ownFile.name}</p>
                      </div>
                    </div>
                  </div>

                  <label className={`flex items-start gap-3 p-4 border-2 rounded-exos cursor-pointer transition-all ${ownAcknowledged ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input type="checkbox" checked={ownAcknowledged} onChange={(e) => setOwnAcknowledged(e.target.checked)}
                      className="mt-0.5 w-4 h-4 flex-shrink-0" />
                    <span className="text-xs text-slate-700 leading-relaxed">
                      I certify that this background check was conducted on me personally and that I have not altered, modified, or misrepresented any of its contents. I understand that submitting a fraudulent or inaccurate document may result in immediate disqualification from the ServiceLink vendor panel.
                    </span>
                  </label>
                </div>
              )}

              {/* Own report: fully complete */}
              {ownFile && ownScanState === 'scanned' && ownAcknowledged && (
                <div className="flex items-center gap-3 p-4 border border-emerald-200 bg-emerald-50 rounded-exos">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">Report submitted for validation</p>
                    <p className="text-xs text-slate-500">We're verifying your report with Sterling · You'll be notified once complete</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="mt-8">
            <NavFooter onBack={onBack} onContinue={handleContinue} continueDisabled={!isValid} />
          </div>
        </div>
      </div>
    </>
  );
};

export default BackgroundCheck;
