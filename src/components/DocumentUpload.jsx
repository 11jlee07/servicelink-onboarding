import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, CheckCircle, FileText, Sparkles, Smartphone, MessageSquare, ArrowLeft } from 'lucide-react';
import { parseDL, parseEOInsurance } from '../utils/mockApi';
import { formatPhone } from '../utils/validation';
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

// Shared uploaded file card — same style for both DL and E&O
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

// Section heading with status icon
const SectionHeader = ({ done, label }) => (
  <div className="flex items-center gap-2 mb-4">
    {done
      ? <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      : <FileText className="w-4 h-4 text-slate-300 flex-shrink-0" />
    }
    <h2 className="text-base font-semibold text-slate-900">{label}</h2>
  </div>
);

const DocumentUpload = ({ state, setState, onNext, onBack }) => {
  // ── DL state ──
  const [dlStatus, setDlStatus] = useState('idle'); // idle | parsing | confirm | editing | done
  const [dlParsed, setDlParsed] = useState(null);
  const [dlPreview, setDlPreview] = useState(null);
  const [dlEdited, setDlEdited] = useState({});
  const dlFileRef = useRef(null);
  const dlCameraRef = useRef(null);

  // ── SMS photo state ──
  const [smsPhone, setSmsPhone] = useState('');
  const [smsStep, setSmsStep] = useState(null); // null | 'entry' | 'sent' | 'waiting'

  const handleSmsSend = () => {
    if (smsPhone.replace(/\D/g, '').length < 10) return;
    setState((prev) => ({
      ...prev,
      basicInfo: { ...prev.basicInfo, phone: smsPhone },
    }));
    setSmsStep('sent');
    setTimeout(() => setSmsStep('waiting'), 1500);
  };

  useEffect(() => {
    if (smsStep !== 'waiting') return;
    const t = setTimeout(() => {
      const blob = new Blob([''], { type: 'image/jpeg' });
      const fakeFile = new File([blob], 'dl-photo.jpg', { type: 'image/jpeg' });
      setSmsStep(null);
      setSmsPhone('');
      handleDLFile(fakeFile);
    }, 7000);
    return () => clearTimeout(t);
  }, [smsStep]);

  // ── E&O state ──
  const [eoFile, setEoFile] = useState(state.eoInsurance?.uploadedFile || null);
  const [eoParseState, setEoParseState] = useState(state.eoInsurance?.parsed ? 'confirmed' : 'idle');
  const [eoFields, setEoFields] = useState(state.eoInsurance?.fields || EO_EMPTY);
  const [eoVisible, setEoVisible] = useState(state.eoInsurance?.parsed ? EO_FIELDS.map((f) => f.key) : []);
  const eoFileRef = useRef(null);

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

  const saveDL = () => {
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
    setDlStatus('done');
  };

  const resetDL = () => {
    setDlStatus('idle');
    setDlParsed(null);
    setDlPreview(null);
    setDlEdited({});
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

  const formatSize = (bytes) =>
    bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

  const eoAllFilled = EO_FIELDS.every((f) => eoFields[f.key]);
  const isValid = dlStatus === 'done' && eoParseState === 'extracted' && eoAllFilled;

  const handleContinue = () => {
    setState((prev) => ({ ...prev, eoInsurance: { uploadedFile: eoFile, fields: eoFields, parsed: true } }));
    onNext();
  };

  const dlData = dlStatus === 'editing' ? dlEdited : dlParsed;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-exos shadow-sm border border-slate-100 p-6">

        {/* Page header */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 1 of 6 · Documents</p>
          <h1 className="text-2xl font-bold text-slate-900">Upload Your Documents</h1>
          <p className="text-sm text-slate-500 mt-1">We'll scan both to get you through setup faster.</p>
        </div>

        {/* ══ DRIVER'S LICENSE ══ */}
        <div className="mb-8">
          <SectionHeader done={dlStatus === 'done'} label="Driver's License" />

          {dlStatus === 'idle' && smsStep === null && (
            <div className="space-y-3">
              {/* Mobile: direct camera capture */}
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

              {/* Desktop: SMS link to phone */}
              <button type="button" onClick={() => setSmsStep('entry')}
                className="hidden md:flex w-full items-center gap-4 p-5 border-2 border-blue-400 bg-blue-50/40 hover:bg-blue-50 rounded-exos transition-all">
                <div className="w-12 h-12 bg-blue-100 rounded-exos flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 text-sm">Take a photo with your phone</p>
                  <p className="text-xs text-slate-500 mt-0.5">We'll text you a link — snap a photo and it appears here automatically</p>
                </div>
              </button>

              {/* Upload from device */}
              <button type="button" onClick={() => dlFileRef.current?.click()}
                className="w-full flex items-center gap-4 p-5 border-2 border-slate-200 bg-white hover:border-blue-300 rounded-exos transition-all">
                <div className="w-12 h-12 bg-slate-100 rounded-exos flex items-center justify-center flex-shrink-0">
                  <Upload className="w-6 h-6 text-slate-500" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 text-sm">Upload from device</p>
                  <p className="text-xs text-slate-500 mt-0.5">JPG, PNG, or PDF</p>
                </div>
              </button>
              <input ref={dlFileRef} type="file" accept="image/*,.pdf" className="hidden"
                onChange={(e) => handleDLFile(e.target.files?.[0])} />
            </div>
          )}

          {/* ── SMS flow ── */}
          {dlStatus === 'idle' && smsStep === 'entry' && (
            <div className="border-2 border-blue-400 bg-blue-50/30 rounded-exos p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Send a link to your phone</p>
                  <p className="text-xs text-slate-500 mt-0.5">Open the link, take a photo of your ID, and it'll appear here automatically.</p>
                </div>
              </div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Your mobile number</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(formatPhone(e.target.value))}
                  placeholder="(555) 000-0000"
                  className="flex-1 border border-slate-200 rounded-exos-sm py-2.5 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleSmsSend}
                  disabled={smsPhone.replace(/\D/g, '').length < 10}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold rounded-exos transition-colors flex-shrink-0"
                >
                  Send link
                </button>
              </div>
              <button type="button" onClick={() => setSmsStep(null)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mt-3 transition-colors">
                <ArrowLeft className="w-3 h-3" /> Back to options
              </button>
            </div>
          )}

          {dlStatus === 'idle' && smsStep === 'sent' && (
            <div className="border-2 border-blue-400 bg-blue-50/30 rounded-exos p-5 text-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-bold text-slate-900 text-sm">Link sent to {smsPhone}</p>
              <p className="text-xs text-slate-500 mt-1">Opening your message now…</p>
            </div>
          )}

          {dlStatus === 'idle' && smsStep === 'waiting' && (
            <div className="border-2 border-blue-400 bg-blue-50/30 rounded-exos p-5">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="relative w-12 h-12">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-100" />
                  <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                  <Smartphone className="absolute inset-0 m-auto w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">Waiting for your photo…</p>
                  <p className="text-xs text-slate-500 mt-0.5">Open the link on <strong>{smsPhone}</strong> and take a photo of your ID. This page will update automatically.</p>
                </div>
              </div>
              <button type="button" onClick={() => setSmsStep(null)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 mt-4 transition-colors mx-auto w-fit">
                <ArrowLeft className="w-3 h-3" /> Use a different method
              </button>
            </div>
          )}

          {dlStatus === 'parsing' && (
            <div className="text-center py-8">
              {dlPreview && (
                <div className="w-48 h-28 mx-auto mb-6 rounded-exos overflow-hidden border border-slate-200">
                  <img src={dlPreview} alt="" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="font-semibold text-slate-900 mb-1">Reading your ID...</p>
              <p className="text-sm text-slate-500">This takes just a moment</p>
            </div>
          )}

          {dlStatus === 'confirm' && dlParsed && (
            <div className="border border-slate-200 rounded-exos p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">We scanned your license</p>
                  <p className="text-sm text-slate-500">Does this look right?</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-exos-sm p-4 space-y-3 mb-4">
                {[
                  { label: 'Name',    value: `${dlParsed.firstName} ${dlParsed.lastName}` },
                  { label: 'Address', value: `${dlParsed.street}, ${dlParsed.city}, ${dlParsed.state} ${dlParsed.zip}` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-4">
                    <span className="text-xs text-slate-500 font-medium w-16 flex-shrink-0 pt-0.5">{label}</span>
                    <span className="text-sm text-slate-900 font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setDlStatus('editing')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Something looks wrong — fix it
                </button>
                <button type="button" onClick={saveDL}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase rounded-exos transition-colors">
                  Yes, that's me
                </button>
              </div>
            </div>
          )}

          {dlStatus === 'editing' && (
            <div className="border border-slate-200 rounded-exos p-5">
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
              <div className="flex justify-between items-center mt-5">
                <button type="button" onClick={() => setDlStatus('confirm')}
                  className="text-sm text-slate-500 hover:text-slate-700 font-medium">
                  Cancel
                </button>
                <button type="button" onClick={saveDL}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase rounded-exos transition-colors">
                  Save & Continue
                </button>
              </div>
            </div>
          )}

          {dlStatus === 'done' && dlData && (
            <UploadedCard
              icon={<FileText className="w-5 h-5 text-slate-500" />}
              primary={`${dlData.firstName} ${dlData.lastName}`}
              secondary={`${dlData.street}, ${dlData.city}, ${dlData.state} ${dlData.zip}`}
              onRemove={resetDL}
            />
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
  );
};

export default DocumentUpload;
