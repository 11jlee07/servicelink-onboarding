import React, { useState, useRef, useEffect } from 'react';
import {
  Shield, ShieldCheck, CheckCircle, AlertCircle, FileText, Sparkles,
  X, Loader2, RotateCcw, ChevronDown, Upload, Camera, Loader
} from 'lucide-react';
import { parseEOInsurance, processLicenseOCR, verifyLicense } from '../utils/mockApi';
import NavFooter from './shared/NavFooter';

/* ── Helpers ──────────────────────────────────────────────────────── */
const isMobile = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none) and (pointer: coarse)').matches;

function mockAscLookup(firstName, lastName) {
  return {
    name: `${firstName} ${lastName}`,
    licenseNumber: 'TX-CR-' + Math.floor(10000 + Math.random() * 89999),
    type: 'Certified Residential',
    state: 'Texas',
    status: 'Active',
    effectiveDate: '2019-03-15',
    expirationDate: '2025-03-14',
    address: '123 Main St, Celina, TX 75009',
  };
}

const inputCls = 'w-full border border-slate-200 rounded-exos-sm py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

const SectionHeader = ({ done, label }) => (
  <div className="flex items-center gap-2 mb-4">
    {done
      ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      : <FileText className="w-4 h-4 text-slate-300 flex-shrink-0" />
    }
    <h2 className="text-base font-semibold text-slate-900">{label}</h2>
  </div>
);

/* ── License sub-components ───────────────────────────────────────── */
const LicenseCard = ({ data }) => (
  <div className="rounded-exos border border-slate-200 overflow-hidden">
    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
      <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Found on ASC.gov</span>
    </div>
    <div className="px-4 py-4 grid grid-cols-2 gap-x-6 gap-y-3">
      {[
        { label: 'Name',      value: data.name },
        { label: 'License #', value: data.licenseNumber },
        { label: 'Type',      value: data.type },
        { label: 'State',     value: data.state },
        { label: 'Status',    value: data.status,
          badge: data.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700' },
        { label: 'Expires',   value: data.expirationDate },
      ].map(({ label, value, badge }) => (
        <div key={label}>
          <p className="text-xs text-slate-400 mb-0.5">{label}</p>
          {badge
            ? <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge}`}>{value}</span>
            : <p className="text-sm font-normal text-slate-800">{value}</p>
          }
        </div>
      ))}
    </div>
  </div>
);

const ReviewFields = ({ ocrData, updateOcr }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-normal text-slate-600 mb-1">State</label>
        <select value={ocrData.state} onChange={(e) => updateOcr('state', e.target.value)} className={inputCls}>
          <option value="">Select state...</option>
          {['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
            'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas',
            'Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota',
            'Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
            'New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon',
            'Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas',
            'Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming']
            .map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-normal text-slate-600 mb-1">License Type</label>
        <select value={ocrData.type} onChange={(e) => updateOcr('type', e.target.value)} className={inputCls}>
          <option value="">Select type...</option>
          {['Certified Residential','Certified General','Licensed Residential',
            'Licensed Appraiser Trainee','State Certified Appraiser','Supervisory Appraiser']
            .map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
    <div>
      <label className="block text-sm font-normal text-slate-600 mb-1">License Number</label>
      <input type="text" value={ocrData.number} onChange={(e) => updateOcr('number', e.target.value)} className={inputCls} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-normal text-slate-600 mb-1">Effective Date</label>
        <input type="date" value={ocrData.effectiveDate} onChange={(e) => updateOcr('effectiveDate', e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="block text-sm font-normal text-slate-600 mb-1">Expiration Date</label>
        <input type="date" value={ocrData.expirationDate} onChange={(e) => updateOcr('expirationDate', e.target.value)} className={inputCls} />
      </div>
    </div>
    <div>
      <label className="block text-sm font-normal text-slate-600 mb-1">License Address</label>
      <input type="text" value={ocrData.address} onChange={(e) => updateOcr('address', e.target.value)} className={inputCls} />
    </div>
  </div>
);

/* ── Idenfy simulation ────────────────────────────────────────────── */
const STEPS = [
  { key: 'launching',  ms: 1000 },
  { key: 'front-id',   ms: 3500 },
  { key: 'back-id',    ms: 3000 },
  { key: 'selfie',     ms: 3200 },
  { key: 'processing', ms: 2200 },
  { key: 'complete',   ms: 1400 },
];

const ScanFrame = ({ shape = 'card' }) => (
  <div className="relative mx-auto bg-slate-50 rounded-xl border border-slate-200"
    style={{ width: shape === 'card' ? 260 : 180, height: shape === 'card' ? 164 : 220 }}>
    {[['top-0 left-0','border-t-2 border-l-2 rounded-tl-lg'],
      ['top-0 right-0','border-t-2 border-r-2 rounded-tr-lg'],
      ['bottom-0 left-0','border-b-2 border-l-2 rounded-bl-lg'],
      ['bottom-0 right-0','border-b-2 border-r-2 rounded-br-lg']]
      .map(([pos, border], i) => (
        <span key={i} className={`absolute ${pos} w-7 h-7 border-blue-500 ${border}`} />
      ))}
    <div className="absolute left-3 right-3 h-0.5 bg-blue-500/60 rounded-full animate-scan shadow-sm" />
    {shape === 'face' && (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-28 rounded-full border-2 border-slate-300" />
      </div>
    )}
  </div>
);

const IdenfyModal = ({ onComplete, onCancel }) => {
  const [stepIdx, setStepIdx] = useState(0);
  const step = STEPS[stepIdx];

  useEffect(() => {
    const t = setTimeout(() => {
      if (stepIdx < STEPS.length - 1) setStepIdx((i) => i + 1);
      else onComplete();
    }, step.ms);
    return () => clearTimeout(t);
  }, [stepIdx]);

  const { key } = step;
  const progress = Math.round((stepIdx / (STEPS.length - 1)) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full md:w-[420px] md:rounded-2xl overflow-hidden flex flex-col bg-white h-[100dvh] md:h-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-900">iDenfy Verification</span>
          </div>
          {key !== 'complete' && (
            <button type="button" onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors p-1.5 rounded-full">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div className="h-full bg-blue-600 transition-all duration-700 ease-out rounded-full" style={{ width: `${progress}%` }} />
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 gap-7 text-center">

          {key === 'launching' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <p className="text-slate-900 font-semibold text-lg mb-1">Launching verification</p>
                <p className="text-slate-500 text-sm">Preparing a secure session…</p>
              </div>
            </>
          )}

          {key === 'front-id' && (
            <>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Step 1 of 3 · Front of ID</p>
              <ScanFrame shape="card" />
              <div>
                <p className="text-slate-900 font-semibold text-lg mb-1">Place the front of your ID in the frame</p>
                <p className="text-slate-500 text-sm">Hold steady — scanning automatically</p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-600 text-xs font-medium">Camera active</span>
              </div>
            </>
          )}

          {key === 'back-id' && (
            <>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Step 1 of 3 · Back of ID</p>
              <ScanFrame shape="card" />
              <div>
                <p className="text-slate-900 font-semibold text-lg mb-1">Now flip to the back of your ID</p>
                <p className="text-slate-500 text-sm">Keep the card flat and well-lit</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 text-xs font-medium">Front captured</span>
              </div>
            </>
          )}

          {key === 'selfie' && (
            <>
              <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Step 2 of 3 · Selfie</p>
              <ScanFrame shape="face" />
              <div>
                <p className="text-slate-900 font-semibold text-lg mb-1">Look straight at the camera</p>
                <p className="text-slate-500 text-sm">We need a quick liveness check</p>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 text-xs font-medium">ID captured</span>
              </div>
            </>
          )}

          {key === 'processing' && (
            <>
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
                <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                <Shield className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-slate-900 font-semibold text-lg mb-1">Verifying your identity…</p>
                <p className="text-slate-500 text-sm">Checking government records · Usually under 10 seconds</p>
              </div>
            </>
          )}

          {key === 'complete' && (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-emerald-600" />
              </div>
              <div>
                <p className="text-slate-900 font-bold text-xl mb-1">Identity Verified</p>
                <p className="text-slate-500 text-sm">Closing and returning to your application…</p>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 pb-6 text-center space-y-1">
          <p className="text-slate-400 text-xs">Powered by iDenfy · Your photos are never stored by ServiceLink</p>
          <p className="text-amber-600 text-xs font-medium">⚠ Prototype only — this flow is simulated. Real integration will launch the iDenfy SDK.</p>
        </div>

      </div>
    </div>
  );
};

/* ── Main component ───────────────────────────────────────────────── */
const DocumentUpload = ({ state, setState, onNext, onBack }) => {
  const [mobile] = useState(isMobile);

  /* ── Idenfy state ── */
  const [idenfyOpen, setIdenfyOpen] = useState(false);
  const [idenfyDone, setIdenfyDone] = useState(!!state.identityVerified);

  const startAscLookup = (firstName, lastName) => {
    setLicenseStage('looking');
    setTimeout(() => {
      setAscData(mockAscLookup(firstName, lastName));
      setLicenseStage('found');
    }, 1800);
  };

  const handleIdenfyComplete = () => {
    setIdenfyOpen(false);
    setIdenfyDone(true);
    // Simulated data extracted by iDenfy from the scanned ID
    const fn = 'Jordan';
    const ln = 'Mitchell';
    setState((prev) => ({
      ...prev,
      identityVerified: true,
      basicInfo: {
        ...prev.basicInfo,
        firstName: prev.basicInfo?.firstName || fn,
        lastName:  prev.basicInfo?.lastName  || ln,
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
    // Cascade: use iDenfy-extracted name to look up the appraisal license
    startAscLookup(fn, ln);
  };

  const resetIdenfy = () => {
    setIdenfyDone(false);
    setState((prev) => ({ ...prev, identityVerified: false }));
  };

  /* ── License state ── */
  const [licenseStage, setLicenseStage] = useState('looking');
  const [ascData, setAscData] = useState(null);
  const [showFallbackHint, setShowFallbackHint] = useState(false);
  const [licenseVerifyResult, setLicenseVerifyResult] = useState(null);
  const [licenseVerifying, setLicenseVerifying] = useState(false);
  const licenseFileRef = useRef(null);
  const licenseCameraRef = useRef(null);

  const ocrData = state.license?.ocrData || { state: '', type: '', number: '', effectiveDate: '', expirationDate: '', address: '' };

  const updateOcr = (field, value) =>
    setState((prev) => ({
      ...prev,
      license: { ...prev.license, ocrData: { ...prev.license?.ocrData, [field]: value } },
    }));

  // If user already completed iDenfy in a prior session, kick off the lookup on mount
  useEffect(() => {
    if (!idenfyDone) return;
    const fn = state.basicInfo?.firstName || 'Jordan';
    const ln = state.basicInfo?.lastName  || 'Mitchell';
    const t = setTimeout(() => {
      setAscData(mockAscLookup(fn, ln));
      setLicenseStage('found');
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  const handleLicenseConfirm = () => {
    setState((prev) => ({
      ...prev,
      license: {
        ...prev.license,
        apiVerified: true,
        ocrData: {
          state: ascData.state, type: ascData.type, number: ascData.licenseNumber,
          effectiveDate: ascData.effectiveDate, expirationDate: ascData.expirationDate, address: ascData.address,
        },
      },
    }));
    setLicenseVerifyResult('success');
    setLicenseStage('done');
  };

  const handleLicenseFile = async (file) => {
    if (!file) return;
    setState((prev) => ({ ...prev, license: { ...prev.license, uploadedFile: file } }));
    setLicenseStage('ocr');
    const data = await processLicenseOCR(file);
    setState((prev) => ({ ...prev, license: { ...prev.license, ocrData: data } }));
    const result = await verifyLicense(data);
    setState((prev) => ({ ...prev, license: { ...prev.license, apiVerified: result.verified, apiError: result.error } }));
    setLicenseVerifyResult(result.verified ? 'success' : 'failure');
    setLicenseStage('done');
  };

  const handleManualLicense = () => {
    setState((prev) => ({
      ...prev,
      license: { ...prev.license, ocrData: { state: '', type: '', number: '', effectiveDate: '', expirationDate: '', address: '' } },
    }));
    setLicenseStage('review');
  };

  const handleVerifyManual = async () => {
    setLicenseVerifying(true);
    const result = await verifyLicense(state.license?.ocrData);
    setState((prev) => ({ ...prev, license: { ...prev.license, apiVerified: result.verified, apiError: result.error } }));
    setLicenseVerifyResult(result.verified ? 'success' : 'failure');
    setLicenseVerifying(false);
    setLicenseStage('done');
  };

  const manualFilled = ocrData?.state && ocrData?.number && ocrData?.type;

  /* ── Validity & continue ── */
  const isValid = idenfyDone && licenseStage === 'done';

  const handleContinue = () => {
    onNext();
  };

  return (
    <>
      {idenfyOpen && <IdenfyModal onComplete={handleIdenfyComplete} onCancel={() => setIdenfyOpen(false)} />}

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-exos shadow-sm border border-slate-100 p-6">

          <div className="mb-8">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 1 of 5 · Identity Verification</p>
            <h1 className="text-2xl font-bold text-slate-900">Verify Your Identity</h1>
            <p className="text-sm text-slate-500 mt-1">We use iDenfy to verify who you are, then confirm your appraiser license with ASC.gov.</p>
          </div>

          {/* ══ IDENFY ══ */}
          <div className="mb-8">
            <SectionHeader done={idenfyDone} label="Identity Verification" />
            {!idenfyDone ? (
              <button type="button" onClick={() => setIdenfyOpen(true)}
                className="w-full flex items-center gap-5 p-5 border-2 border-blue-400 bg-blue-50/40 hover:bg-blue-50 rounded-exos transition-all group">
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
            ) : (
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

          <div className="border-t border-slate-100 mb-8" />

          {/* ══ APPRAISER LICENSE ══ */}
          <div className="mb-2">
            <SectionHeader done={licenseStage === 'done'} label="Appraiser License" />

            {/* Waiting for iDenfy */}
            {licenseStage === 'looking' && !idenfyDone && (
              <div className="py-8 flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-exos bg-slate-100 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">Complete identity verification above</p>
                  <p className="text-xs text-slate-400 mt-0.5">We'll use your ID to look up your license on ASC.gov automatically</p>
                </div>
              </div>
            )}

            {/* Looking up on ASC (after iDenfy) */}
            {licenseStage === 'looking' && idenfyDone && (
              <div className="py-10 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-exos bg-blue-50 flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7 text-blue-600" />
                  </div>
                  <Loader className="w-4 h-4 text-blue-500 animate-spin absolute -bottom-1 -right-1" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-900 text-sm">Looking you up on ASC.gov…</p>
                  <p className="text-xs text-slate-500 mt-1">Using your verified name to search the national appraiser registry</p>
                </div>
              </div>
            )}

            {/* Found */}
            {licenseStage === 'found' && ascData && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600 leading-relaxed">
                  Using the name from your verified ID, we found a matching license on ASC.gov. Confirm it's yours before we move on.
                </p>
                <LicenseCard data={ascData} />
                <div className="flex flex-col gap-2.5">
                  <button type="button" onClick={handleLicenseConfirm}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase rounded-exos transition-colors flex items-center justify-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4" /> Yes, that's my license
                  </button>
                  <button type="button" onClick={() => setLicenseStage('fallback')}
                    className="w-full py-3 border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-exos transition-colors text-sm">
                    No, this isn't mine
                  </button>
                </div>
                <div className="pt-1 border-t border-slate-100">
                  <button type="button" onClick={() => setShowFallbackHint((p) => !p)}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showFallbackHint ? 'rotate-180' : ''}`} />
                    What if the system can't find my license?
                  </button>
                  {showFallbackHint && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-exos text-xs text-slate-500 leading-relaxed">
                      You can upload a photo or PDF of your license, or enter details manually. We'll verify before submission.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fallback */}
            {licenseStage === 'fallback' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-600">Upload your license and we'll extract the details, or enter them manually.</p>
                <div className="space-y-2.5">
                  {mobile && (
                    <button type="button" onClick={() => licenseCameraRef.current?.click()}
                      className="w-full flex items-center gap-4 p-4 border-2 border-slate-200 hover:border-blue-400 rounded-exos text-left transition-all group">
                      <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-50 rounded-exos flex items-center justify-center flex-shrink-0 transition-colors">
                        <Camera className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Take a photo</p>
                        <p className="text-xs text-slate-400 mt-0.5">Use your camera</p>
                      </div>
                    </button>
                  )}
                  <button type="button" onClick={() => licenseFileRef.current?.click()}
                    className="w-full flex items-center gap-4 p-4 border-2 border-slate-200 hover:border-blue-400 rounded-exos text-left transition-all group">
                    <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-50 rounded-exos flex items-center justify-center flex-shrink-0 transition-colors">
                      <Upload className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{mobile ? 'Upload from files' : 'Upload a file'}</p>
                      <p className="text-xs text-slate-400 mt-0.5">PDF, JPG, or PNG · Max 10 MB</p>
                    </div>
                  </button>
                  <button type="button" onClick={handleManualLicense}
                    className="w-full flex items-center gap-4 p-4 border-2 border-slate-200 hover:border-blue-400 rounded-exos text-left transition-all group">
                    <div className="w-10 h-10 bg-slate-100 group-hover:bg-blue-50 rounded-exos flex items-center justify-center flex-shrink-0 transition-colors">
                      <FileText className="w-5 h-5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">Enter details manually</p>
                      <p className="text-xs text-slate-400 mt-0.5">Type in your license number, type, and dates</p>
                    </div>
                  </button>
                </div>
                <input ref={licenseCameraRef} type="file" accept="image/*" capture="environment"
                  onChange={(e) => handleLicenseFile(e.target.files[0])} className="hidden" />
                <input ref={licenseFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleLicenseFile(e.target.files[0])} className="hidden" />
              </div>
            )}

            {/* OCR */}
            {licenseStage === 'ocr' && (
              <div className="text-center py-12">
                <Loader className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="font-semibold text-slate-900 text-sm mb-1">Reading your license…</p>
                <p className="text-xs text-slate-500">Extracting and verifying details</p>
              </div>
            )}

            {/* Manual review */}
            {licenseStage === 'review' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Fill in your license details and we'll verify with ASC.gov.</p>
                <ReviewFields ocrData={ocrData} updateOcr={updateOcr} />
                {licenseVerifying ? (
                  <div className="flex items-center justify-center gap-2 py-3 text-sm text-slate-500">
                    <Loader className="w-4 h-4 animate-spin" /> Verifying…
                  </div>
                ) : (
                  <button type="button" onClick={handleVerifyManual} disabled={!manualFilled}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-sm font-bold uppercase rounded-exos transition-colors">
                    Verify with ASC.gov
                  </button>
                )}
              </div>
            )}

            {/* Done */}
            {licenseStage === 'done' && (
              <div className="space-y-4">
                {licenseVerifyResult === 'success' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-exos flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-900 text-sm">License verified</p>
                      <p className="text-sm text-emerald-700 mt-0.5">Your license is active and in good standing with ASC.gov.</p>
                    </div>
                  </div>
                )}
                {licenseVerifyResult === 'failure' && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-exos flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900 text-sm">Couldn't verify automatically</p>
                      <p className="text-sm text-amber-700 mt-0.5 leading-relaxed">
                        This sometimes happens with newly-issued licenses. You can continue — our team will review within 24 hours.
                      </p>
                    </div>
                  </div>
                )}
                <ReviewFields ocrData={ocrData} updateOcr={updateOcr} />
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
