import React, { useState, useRef, useEffect } from 'react';
import { Shield, ShieldCheck, CheckCircle, FileText, Sparkles, X, Loader2, RotateCcw } from 'lucide-react';
import { parseEOInsurance } from '../utils/mockApi';
import NavFooter from './shared/NavFooter';

const EO_FIELDS = [
  { key: 'underwriter',      label: 'Underwriter (Company)',  placeholder: 'e.g. Berkley One Insurance',  type: 'text' },
  { key: 'policyNumber',     label: 'Binder / Policy #',      placeholder: 'e.g. EO-2024-884421-TX',     type: 'text' },
  { key: 'limitOfLiability', label: 'Limit of Liability',     placeholder: 'e.g. 1,000,000',             type: 'text' },
  { key: 'effectiveDate',    label: 'Effective Date',         placeholder: '',                            type: 'date' },
  { key: 'expirationDate',   label: 'Expiration Date',        placeholder: '',                            type: 'date' },
];
const EO_EMPTY = { underwriter: '', policyNumber: '', limitOfLiability: '', effectiveDate: '', expirationDate: '' };
const FIELD_DELAY = [0, 120, 240, 360, 480];

const inputCls = 'w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm';

const UploadedCard = ({ icon, primary, secondary, onRemove }) => (
  <div className="flex items-center gap-3 p-4 border border-slate-200 bg-slate-50 rounded-exos">
    <div className="w-10 h-10 rounded-exos bg-slate-100 flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-slate-900 truncate">{primary}</p>
      <p className="text-xs text-slate-500 truncate">{secondary}</p>
    </div>
    <button type="button" onClick={onRemove}
      className="flex-shrink-0 text-xs font-medium text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 rounded-exos-sm px-3 py-1.5 transition-colors">
      Reupload
    </button>
  </div>
);

const SectionHeader = ({ done, label }) => (
  <div className="flex items-center gap-2 mb-4">
    {done
      ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      : <FileText className="w-4 h-4 text-slate-300 flex-shrink-0" />
    }
    <h2 className="text-base font-semibold text-slate-900">{label}</h2>
  </div>
);

/* ── Idenfy simulation step config ───────────────────────────────── */
const STEPS = [
  { key: 'launching',   ms: 1000 },
  { key: 'front-id',    ms: 3500 },
  { key: 'back-id',     ms: 3000 },
  { key: 'selfie',      ms: 3200 },
  { key: 'processing',  ms: 2200 },
  { key: 'complete',    ms: 1400 },
];

/* ── Scanning frame with animated line ───────────────────────────── */
const ScanFrame = ({ shape = 'card' }) => (
  <div className="relative mx-auto"
    style={{ width: shape === 'card' ? 260 : 180, height: shape === 'card' ? 164 : 220 }}>
    {/* corner brackets */}
    {[['top-0 left-0', 'border-t-2 border-l-2'],
      ['top-0 right-0', 'border-t-2 border-r-2'],
      ['bottom-0 left-0', 'border-b-2 border-l-2'],
      ['bottom-0 right-0', 'border-b-2 border-r-2'],
    ].map(([pos, border], i) => (
      <span key={i} className={`absolute ${pos} w-6 h-6 border-blue-400 rounded-sm ${border}`} />
    ))}
    {/* scanning line */}
    <div className="absolute left-2 right-2 h-0.5 bg-blue-400/70 rounded-full animate-scan" />
    {/* overlay text */}
    <div className="absolute inset-0 flex items-center justify-center">
      {shape === 'face' && (
        <div className="w-20 h-28 rounded-full border-2 border-white/20" />
      )}
    </div>
  </div>
);

/* ── Main Idenfy modal ────────────────────────────────────────────── */
const IdenfyModal = ({ onComplete, onCancel }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];

  useEffect(() => {
    const t = setTimeout(() => {
      if (stepIdx < STEPS.length - 1) {
        setStepIdx((i) => i + 1);
      } else {
        onComplete();
      }
    }, step.ms);
    return () => clearTimeout(t);
  }, [stepIdx]);

  const isLaunching  = step.key === 'launching';
  const isFront      = step.key === 'front-id';
  const isBack       = step.key === 'back-id';
  const isSelfie     = step.key === 'selfie';
  const isProcessing = step.key === 'processing';
  const isComplete   = step.key === 'complete';

  const progress = Math.round(((stepIdx) / (STEPS.length - 1)) * 100);

  return (
    /* backdrop */
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/70 backdrop-blur-sm">

      {/* modal — full screen on mobile, centered card on desktop */}
      <div className="
        w-full md:w-[420px] md:rounded-2xl overflow-hidden
        flex flex-col
        bg-[#0d1117]
        h-[100dvh] md:h-auto
        relative
      ">

        {/* header bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">iDenfy Verification</span>
          </div>
          {!isComplete && (
            <button type="button" onClick={onCancel}
              className="text-white/40 hover:text-white/80 transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* progress bar */}
        <div className="h-0.5 bg-white/10">
          <div
            className="h-full bg-blue-500 transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* body */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 gap-6 text-center">

          {isLaunching && (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg mb-1">Launching verification</p>
                <p className="text-white/50 text-sm">Preparing a secure session…</p>
              </div>
            </>
          )}

          {isFront && (
            <>
              <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Step 1 of 3 · Front of ID</p>
              <ScanFrame shape="card" />
              <div>
                <p className="text-white font-semibold text-lg mb-1">Place the front of your ID in the frame</p>
                <p className="text-white/50 text-sm">Hold steady — scanning automatically</p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-2.5">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/70 text-xs">Camera active</span>
              </div>
            </>
          )}

          {isBack && (
            <>
              <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Step 1 of 3 · Back of ID</p>
              <ScanFrame shape="card" />
              <div>
                <p className="text-white font-semibold text-lg mb-1">Now flip to the back of your ID</p>
                <p className="text-white/50 text-sm">Keep the card flat and well-lit</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs">Front captured</span>
              </div>
            </>
          )}

          {isSelfie && (
            <>
              <p className="text-white/50 text-xs uppercase tracking-widest font-semibold">Step 2 of 3 · Selfie</p>
              <ScanFrame shape="face" />
              <div>
                <p className="text-white font-semibold text-lg mb-1">Look straight at the camera</p>
                <p className="text-white/50 text-sm">We need a quick liveness check</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs">ID captured</span>
              </div>
            </>
          )}

          {isProcessing && (
            <>
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-white/10" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                <Shield className="absolute inset-0 m-auto w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-semibold text-lg mb-1">Verifying your identity…</p>
                <p className="text-white/50 text-sm">Checking government records · Usually under 10 seconds</p>
              </div>
            </>
          )}

          {isComplete && (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-400/40 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <p className="text-white font-bold text-xl mb-1">Identity Verified</p>
                <p className="text-white/50 text-sm">Closing and returning to your application…</p>
              </div>
            </>
          )}

        </div>

        {/* footer note */}
        <div className="px-5 pb-6 text-center space-y-1">
          <p className="text-white/25 text-xs">Powered by iDenfy · Your photos are never stored by ServiceLink</p>
          <p className="text-amber-400/70 text-xs font-medium">⚠ Prototype only — this flow is simulated. Real integration will launch the iDenfy SDK.</p>
        </div>

      </div>
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────────── */
const DocumentUpload = ({ state, setState, onNext, onBack }) => {

  /* ── Identity verification state ── */
  const [idenfyOpen, setIdenfyOpen]     = useState(false);
  const [idenfyDone, setIdenfyDone]     = useState(!!state.identityVerified);

  const handleIdenfyComplete = () => {
    setIdenfyOpen(false);
    setIdenfyDone(true);
    // Simulate extracted identity data pre-populating basicInfo
    setState((prev) => ({
      ...prev,
      identityVerified: true,
      basicInfo: {
        ...prev.basicInfo,
        firstName: prev.basicInfo?.firstName || 'Jordan',
        lastName:  prev.basicInfo?.lastName  || 'Mitchell',
        address: {
          ...prev.basicInfo?.address,
          street:    prev.basicInfo?.address?.street    || '4821 Oak Ridge Blvd',
          city:      prev.basicInfo?.address?.city      || 'Dallas',
          state:     prev.basicInfo?.address?.state     || 'TX',
          zip:       prev.basicInfo?.address?.zip       || '75201',
          validated: true,
        },
      },
    }));
  };

  const resetIdenfy = () => {
    setIdenfyDone(false);
    setState((prev) => ({ ...prev, identityVerified: false }));
  };

  /* ── E&O state ── */
  const [eoFile,       setEoFile]       = useState(state.eoInsurance?.uploadedFile || null);
  const [eoParseState, setEoParseState] = useState(state.eoInsurance?.parsed ? 'extracted' : 'idle');
  const [eoFields,     setEoFields]     = useState(state.eoInsurance?.fields || EO_EMPTY);
  const [eoVisible,    setEoVisible]    = useState(state.eoInsurance?.parsed ? EO_FIELDS.map((f) => f.key) : []);
  const eoFileRef = useRef(null);

  /* ── E&O handlers ── */
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
  const isValid = idenfyDone && eoParseState === 'extracted' && eoAllFilled;

  const handleContinue = () => {
    setState((prev) => ({ ...prev, eoInsurance: { uploadedFile: eoFile, fields: eoFields, parsed: true } }));
    onNext();
  };

  return (
    <>
      {idenfyOpen && (
        <IdenfyModal
          onComplete={handleIdenfyComplete}
          onCancel={() => setIdenfyOpen(false)}
        />
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-exos shadow-sm border border-slate-100 p-6">

          {/* Page header */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 1 of 6 · Documents</p>
            <h1 className="text-2xl font-bold text-slate-900">Verify Your Identity</h1>
            <p className="text-sm text-slate-500 mt-1">We use iDenfy to verify your identity securely. Your ID photos are never stored by ServiceLink.</p>
          </div>

          {/* ══ IDENTITY VERIFICATION ══ */}
          <div className="mb-8">
            <SectionHeader done={idenfyDone} label="Identity Verification" />

            {!idenfyDone && (
              <button
                type="button"
                onClick={() => setIdenfyOpen(true)}
                className="w-full flex items-center gap-5 p-5 border-2 border-blue-400 bg-blue-50/40 hover:bg-blue-50 rounded-exos transition-all group"
              >
                <div className="w-14 h-14 bg-blue-100 group-hover:bg-blue-200 rounded-exos flex items-center justify-center flex-shrink-0 transition-colors">
                  <Shield className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-slate-900 text-sm">Verify your identity</p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Takes about 60 seconds. You'll scan your government-issued ID and take a quick selfie.
                  </p>
                  <p className="text-xs text-blue-500 mt-1.5 font-medium">Tap to start →</p>
                </div>
              </button>
            )}

            {idenfyDone && (
              <div className="flex items-center gap-4 p-4 border border-emerald-200 bg-emerald-50 rounded-exos">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-900">Identity verified</p>
                  <p className="text-xs text-emerald-700 mt-0.5">Powered by iDenfy · Your photos were not stored by ServiceLink</p>
                </div>
                <button type="button" onClick={resetIdenfy}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 bg-white rounded-exos-sm px-3 py-1.5 transition-colors flex-shrink-0">
                  <RotateCcw className="w-3 h-3" /> Redo
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-exos-border-light mb-8" />

          {/* ══ E&O INSURANCE ══ */}
          <div className="mb-2">
            <SectionHeader done={eoParseState === 'extracted' && eoAllFilled} label="E&O Insurance" />

            <p className="text-sm text-slate-500 mb-5">
              Upload your certificate of insurance. We'll extract the policy details automatically.
            </p>

            {!eoFile && (
              <div onDrop={(e) => { e.preventDefault(); handleEOFile(e.dataTransfer.files[0]); }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => eoFileRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-exos p-12 text-center cursor-pointer transition-colors group">
                <div className="w-16 h-16 bg-slate-100 group-hover:bg-blue-50 rounded-exos flex items-center justify-center mx-auto mb-4 transition-colors">
                  <FileText className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-slate-700 font-medium mb-1">Drop your E&amp;O certificate here or click to browse</p>
                <p className="text-sm text-slate-400">PDF, JPG, or PNG · Max 10 MB</p>
                <input ref={eoFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleEOFile(e.target.files[0])} className="hidden" />
              </div>
            )}

            {eoFile && (
              <div className="space-y-5">
                <UploadedCard
                  icon={<FileText className="w-5 h-5 text-slate-500" />}
                  primary={eoFile.name}
                  secondary={formatSize(eoFile.size) + (eoParseState === 'parsing' ? ' · Analyzing…' : '')}
                  onRemove={removeEO}
                />

                {eoParseState === 'parsing' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
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
                          <input
                            type={field.type}
                            value={eoFields[field.key]}
                            onChange={(e) => setEoFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full border border-slate-200 rounded-exos-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <NavFooter
            onBack={onBack}
            onContinue={handleContinue}
            continueLabel="Continue"
            continueDisabled={!isValid}
          />
        </div>
      </div>
    </>
  );
};

export default DocumentUpload;
