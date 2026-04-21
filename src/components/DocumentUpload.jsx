import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle, FileText, X, Sparkles } from 'lucide-react';
import { parseDL, parseEOInsurance } from '../utils/mockApi';
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

const TOTAL = 2;

const DocumentUpload = ({ state, setState, onNext, onBack }) => {
  const [step, setStep] = useState(1);

  // ── DL state ──
  const [dlStatus, setDlStatus] = useState('idle'); // idle | parsing | confirm | editing
  const [dlParsed, setDlParsed] = useState(null);
  const [dlPreview, setDlPreview] = useState(null);
  const [dlEdited, setDlEdited] = useState({});
  const dlFileRef = useRef(null);
  const dlCameraRef = useRef(null);

  // ── E&O state ──
  const [eoFile, setEoFile] = useState(state.eoInsurance?.uploadedFile || null);
  const [eoParseState, setEoParseState] = useState(state.eoInsurance?.parsed ? 'confirmed' : 'idle');
  const [eoFields, setEoFields] = useState(state.eoInsurance?.fields || EO_EMPTY);
  const [eoVisible, setEoVisible] = useState(state.eoInsurance?.parsed ? EO_FIELDS.map((f) => f.key) : []);
  const eoFileRef = useRef(null);
  const eoChangeRef = useRef(null);

  // ── DL handlers ──
  const handleDLFile = async (file) => {
    if (!file) return;
    setDlPreview(URL.createObjectURL(file));
    setDlStatus('parsing');
    const result = await parseDL(file);
    setDlParsed(result);
    setDlEdited(result);
    setDlStatus('confirm');
  };

  const saveDLAndAdvance = () => {
    const data = dlStatus === 'editing' ? dlEdited : dlParsed;
    setState((prev) => ({
      ...prev,
      basicInfo: {
        ...prev.basicInfo,
        firstName: data.firstName,
        lastName: data.lastName,
        address: { ...prev.basicInfo.address, street: data.street, city: data.city, state: data.state, zip: data.zip, validated: true },
      },
    }));
    setStep(2);
  };

  const dlField = (key, label, placeholder) => (
    <div>
      <label className="block text-sm font-normal text-slate-500 mb-1">{label}</label>
      <input type="text" value={dlEdited[key] || ''} placeholder={placeholder}
        onChange={(e) => setDlEdited((p) => ({ ...p, [key]: e.target.value }))}
        className={inputCls} />
    </div>
  );

  // ── E&O handlers ──
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

  const handleEOConfirm = () => {
    setEoParseState('confirmed');
    setState((prev) => ({ ...prev, eoInsurance: { uploadedFile: eoFile, fields: eoFields, parsed: true } }));
  };

  const formatSize = (bytes) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const eoAllFilled = EO_FIELDS.every((f) => eoFields[f.key]);

  // ── Nav ──
  const isValid = () => {
    if (step === 1) return dlStatus === 'confirm' || dlStatus === 'editing';
    if (step === 2) return eoParseState === 'confirmed';
    return false;
  };

  const handleContinue = () => {
    if (step === 1) saveDLAndAdvance();
    else onNext();
  };

  const handleBack = () => {
    if (step === 1) {
      if (dlStatus === 'editing') setDlStatus('confirm');
      else onBack();
    } else {
      setStep(1);
    }
  };

  const continueLabel =
    step === 1
      ? dlStatus === 'confirm' ? "Yes, that's me"
      : dlStatus === 'editing' ? 'Save & Continue'
      : 'Continue'
    : 'Continue';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-exos shadow-sm border border-slate-100 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 1 of 6 · Documents</p>
            <h1 className="text-2xl font-bold text-slate-900">
              {step === 1 ? "Driver's License" : 'E&O Insurance'}
            </h1>
          </div>
          <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-3 py-1">{step} of {TOTAL}</span>
        </div>

        {/* ══ STEP 1: DRIVER'S LICENSE ══ */}
        {step === 1 && (
          <>
            {dlStatus === 'idle' && (
              <>
                <p className="text-slate-500 text-sm mb-6">
                  Upload a photo of your driver's license. We'll scan it to verify your identity.
                </p>
                <div className="space-y-3">
                  <button type="button" onClick={() => dlCameraRef.current?.click()}
                    className="md:hidden w-full flex items-center gap-4 p-5 border-2 border-blue-400 bg-blue-50/40 hover:bg-blue-50 rounded-exos transition-all">
                    <div className="w-12 h-12 bg-blue-100 rounded-exos flex items-center justify-center flex-shrink-0">
                      <Camera className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 text-sm">Take a photo</p>
                      <p className="text-xs text-slate-500 mt-0.5">Use your camera to capture your ID</p>
                    </div>
                  </button>
                  <input ref={dlCameraRef} type="file" accept="image/*" capture="environment" className="hidden"
                    onChange={(e) => handleDLFile(e.target.files?.[0])} />

                  <button type="button" onClick={() => dlFileRef.current?.click()}
                    className="w-full flex items-center gap-4 p-5 border-2 border-blue-400 bg-blue-50/40 hover:bg-blue-50 md:border-slate-200 md:bg-white md:hover:border-blue-300 rounded-exos transition-all">
                    <div className="w-12 h-12 bg-blue-100 md:bg-slate-100 rounded-exos flex items-center justify-center flex-shrink-0">
                      <Upload className="w-6 h-6 text-blue-600 md:text-slate-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-slate-900 text-sm">Upload from device</p>
                      <p className="text-xs text-slate-500 mt-0.5">JPG, PNG, or PDF</p>
                    </div>
                  </button>
                  <input ref={dlFileRef} type="file" accept="image/*,.pdf" className="hidden"
                    onChange={(e) => handleDLFile(e.target.files?.[0])} />
                </div>
                <p className="text-xs text-slate-400 text-center mt-6">Your ID is encrypted and never stored permanently.</p>
              </>
            )}

            {dlStatus === 'parsing' && (
              <div className="text-center py-12">
                {dlPreview && (
                  <div className="w-48 h-28 mx-auto mb-8 rounded-exos overflow-hidden border border-slate-200">
                    <img src={dlPreview} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
                <p className="font-semibold text-slate-900 mb-1">Reading your ID...</p>
                <p className="text-sm text-slate-500">This takes just a moment</p>
              </div>
            )}

            {dlStatus === 'confirm' && dlParsed && (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">We scanned your license</p>
                    <p className="text-sm text-slate-500">Does this look right?</p>
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-exos p-5 space-y-3 mb-4">
                  {[
                    { label: 'Name', value: `${dlParsed.firstName} ${dlParsed.lastName}` },
                    { label: 'Address', value: `${dlParsed.street}, ${dlParsed.city}, ${dlParsed.state} ${dlParsed.zip}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-start gap-4">
                      <span className="text-xs text-slate-500 font-medium w-16 flex-shrink-0 pt-0.5">{label}</span>
                      <span className="text-sm text-slate-900 font-medium text-right">{value}</span>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => setDlStatus('editing')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Something looks wrong — fix it
                </button>
              </>
            )}

            {dlStatus === 'editing' && (
              <>
                <p className="text-slate-500 text-sm mb-5">Fix anything that doesn't look right.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {dlField('firstName', 'First Name', 'First name')}
                    {dlField('lastName', 'Last Name', 'Last name')}
                  </div>
                  {dlField('street', 'Street Address', '123 Main St')}
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-2">{dlField('city', 'City', 'City')}</div>
                    <div className="col-span-1">{dlField('state', 'State', 'TX')}</div>
                    <div className="col-span-2">{dlField('zip', 'ZIP', '75201')}</div>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {/* ══ STEP 2: E&O INSURANCE ══ */}
        {step === 2 && (
          <>
            <p className="text-slate-500 text-sm mb-6">
              Upload your certificate of insurance. We'll extract the policy details automatically.
            </p>

            {!eoFile && (
              <div onDrop={(e) => { e.preventDefault(); handleEOFile(e.dataTransfer.files[0]); }}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => eoFileRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-exos p-12 text-center cursor-pointer transition-colors group mb-6">
                <div className="w-16 h-16 bg-slate-100 group-hover:bg-blue-50 rounded-exos flex items-center justify-center mx-auto mb-4 transition-colors">
                  <Upload className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-slate-700 font-medium mb-1">Drop your E&amp;O certificate here or click to browse</p>
                <p className="text-sm text-slate-400">PDF, JPG, or PNG · Max 10 MB</p>
                <input ref={eoFileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleEOFile(e.target.files[0])} className="hidden" />
              </div>
            )}

            {eoFile && (
              <div className="space-y-5">
                {/* File card */}
                <div className={`flex items-center justify-between p-4 border rounded-exos-sm transition-colors ${
                  eoParseState === 'confirmed' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-exos flex items-center justify-center flex-shrink-0 ${
                      eoParseState === 'confirmed' ? 'bg-emerald-100' : 'bg-slate-100'
                    }`}>
                      <FileText className={`w-5 h-5 ${eoParseState === 'confirmed' ? 'text-emerald-600' : 'text-slate-500'}`} />
                    </div>
                    <div>
                      <p className="font-normal text-slate-900 text-sm">{eoFile.name}</p>
                      <p className="text-xs text-slate-500">{formatSize(eoFile.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {eoParseState === 'parsing' && (
                      <span className="text-xs text-blue-600 font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Analyzing…
                      </span>
                    )}
                    {eoParseState === 'confirmed' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                    <button type="button" onClick={removeEO} className="text-slate-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Parsing skeleton */}
                {eoParseState === 'parsing' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
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

                {/* Extracted / confirmed fields */}
                {(eoParseState === 'extracted' || eoParseState === 'confirmed') && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                      <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {eoParseState === 'confirmed' ? 'Details confirmed' : 'Review extracted details'}
                      </p>
                    </div>

                    {EO_FIELDS.map((field) => {
                      const visible = eoVisible.includes(field.key);
                      return (
                        <div key={field.key} style={{
                          opacity: visible ? 1 : 0,
                          transform: visible ? 'translateY(0)' : 'translateY(6px)',
                          transition: 'opacity 300ms ease, transform 300ms ease',
                        }}>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-normal text-slate-700">{field.label}</label>
                            {visible && eoParseState !== 'confirmed' && (
                              <span className="flex items-center gap-1 text-xs text-blue-500 font-medium">
                                <Sparkles className="w-3 h-3" /> AI extracted
                              </span>
                            )}
                            {eoParseState === 'confirmed' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                          </div>
                          <input
                            type={field.type}
                            value={eoFields[field.key]}
                            onChange={(e) => {
                              setEoFields((prev) => ({ ...prev, [field.key]: e.target.value }));
                              if (eoParseState === 'confirmed') setEoParseState('extracted');
                            }}
                            placeholder={field.placeholder}
                            disabled={eoParseState === 'confirmed'}
                            className={`w-full border rounded-exos-sm py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                              eoParseState === 'confirmed'
                                ? 'border-slate-200 bg-slate-50 text-slate-600 cursor-default'
                                : 'border-blue-200 bg-blue-50/30 text-slate-900'
                            }`}
                          />
                        </div>
                      );
                    })}

                    {eoParseState === 'extracted' && (
                      <div className="pt-1 flex gap-2">
                        <button type="button" onClick={() => eoChangeRef.current?.click()}
                          className="px-4 py-2.5 border-2 border-slate-200 hover:border-slate-300 rounded-exos text-sm font-normal text-slate-600 transition-colors">
                          Upload different file
                        </button>
                        <button type="button" onClick={handleEOConfirm} disabled={!eoAllFilled}
                          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold uppercase rounded-exos text-sm transition-colors">
                          Confirm details
                        </button>
                      </div>
                    )}

                    {eoParseState === 'confirmed' && (
                      <button type="button" onClick={() => setEoParseState('extracted')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        Edit details
                      </button>
                    )}

                    <input ref={eoChangeRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleEOFile(e.target.files[0])} className="hidden" />
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <NavFooter
          onBack={handleBack}
          onContinue={handleContinue}
          continueLabel={continueLabel}
          continueDisabled={!isValid()}
        />
      </div>
    </div>
  );
};

export default DocumentUpload;
