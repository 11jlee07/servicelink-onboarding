import React, { useState } from 'react';
import { FileText, Loader, CheckCircle, AlertCircle, Upload } from 'lucide-react';
import { processLicenseOCR, verifyLicense } from '../utils/mockApi';

const US_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri',
  'Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York',
  'North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington',
  'West Virginia','Wisconsin','Wyoming'];

const LICENSE_TYPES = ['Certified Residential','Certified General','Licensed Residential',
  'Licensed Appraiser Trainee','State Certified Appraiser','Supervisory Appraiser'];

const LicenseUpload = ({ state, setState, onNext, onBack }) => {
  const [stage, setStage] = useState('upload'); // 'upload' | 'ocr' | 'verify' | 'done'
  const [apiResult, setApiResult] = useState(null); // 'success' | 'failure'
  const [manualEntry, setManualEntry] = useState(false);
  const [manualVerifying, setManualVerifying] = useState(false);

  const ocrData = state.license.ocrData;

  const updateOcr = (field, value) =>
    setState((prev) => ({
      ...prev,
      license: { ...prev.license, ocrData: { ...prev.license.ocrData, [field]: value } },
    }));

  const handleFile = async (file) => {
    if (!file) return;
    setState((prev) => ({ ...prev, license: { ...prev.license, uploadedFile: file } }));
    setStage('ocr');

    const data = await processLicenseOCR(file);
    setState((prev) => ({ ...prev, license: { ...prev.license, ocrData: data } }));
    setStage('verify');

    const result = await verifyLicense(data);
    setState((prev) => ({
      ...prev,
      license: { ...prev.license, apiVerified: result.verified, apiError: result.error },
    }));
    setApiResult(result.verified ? 'success' : 'failure');
    setStage('done');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleManual = () => {
    setManualEntry(true);
    setStage('done');
    setState((prev) => ({
      ...prev,
      license: {
        ...prev.license,
        ocrData: { state: '', type: '', number: '', effectiveDate: '', expirationDate: '', address: '' },
      },
    }));
  };

  const handleManualVerify = async () => {
    setManualVerifying(true);
    const result = await verifyLicense(state.license.ocrData);
    setState((prev) => ({
      ...prev,
      license: { ...prev.license, apiVerified: result.verified, apiError: result.error },
    }));
    setApiResult(result.verified ? 'success' : 'failure');
    setManualVerifying(false);
  };

  const manualFormFilled = state.license.ocrData?.state && state.license.ocrData?.number && state.license.ocrData?.type;

  const inputCls = 'w-full border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 5 of 8</p>
            <h1 className="text-2xl font-bold text-slate-900">Appraiser License</h1>
          </div>
        </div>

        {/* Upload zone */}
        {stage === 'upload' && (
          <>
            <p className="text-slate-500 text-sm mb-6">
              Upload a photo or PDF of your license. We'll extract the details automatically and verify with ASC.gov.
            </p>

            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('licenseFile').click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
            >
              <div className="w-16 h-16 bg-slate-100 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Upload className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-slate-700 font-medium mb-1">Drop your license here or click to browse</p>
              <p className="text-sm text-slate-400">PDF, JPG, or PNG · Max 10 MB</p>
              <input id="licenseFile" type="file" accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
            </div>

            <div className="text-center mt-4">
              <button type="button" onClick={handleManual}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Prefer to enter details manually →
              </button>
            </div>
          </>
        )}

        {/* OCR processing */}
        {stage === 'ocr' && (
          <div className="text-center py-16">
            <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg font-semibold text-slate-900 mb-1">Reading your license...</p>
            <p className="text-sm text-slate-500">Extracting details automatically</p>
          </div>
        )}

        {/* Verifying */}
        {stage === 'verify' && (
          <>
            <OcrFields ocrData={ocrData} updateOcr={updateOcr} inputCls={inputCls} />
            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 text-sm">Verifying with ASC.gov...</p>
                <p className="text-xs text-slate-500">This takes a few seconds</p>
              </div>
            </div>
          </>
        )}

        {/* Done */}
        {stage === 'done' && (
          <>
            <OcrFields ocrData={ocrData} updateOcr={updateOcr} inputCls={inputCls} />

            {/* API success */}
            {apiResult === 'success' && (
              <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-900 text-sm">License verified!</p>
                  <p className="text-sm text-emerald-700">Your license is active and in good standing with ASC.gov.</p>
                </div>
              </div>
            )}

            {/* API failure */}
            {apiResult === 'failure' && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900 text-sm">Couldn't verify automatically</p>
                    <p className="text-sm text-amber-700 mt-1">
                      This could be a minor typo, a temporary issue with the state board system, or your state may not be available online.
                      You can correct the details above or continue — our team will review manually within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual entry — verify button */}
            {manualEntry && !apiResult && (
              <div className="mt-6 space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900">
                  Fill in your license details above, then verify with ASC.gov.
                </div>
                {manualVerifying ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                    <Loader className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-900 text-sm">Verifying with ASC.gov...</p>
                      <p className="text-xs text-slate-500">This takes a few seconds</p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleManualVerify}
                    disabled={!manualFormFilled}
                    className="w-full py-2.5 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 disabled:border-slate-200 disabled:text-slate-400 transition-colors text-sm"
                  >
                    Verify with ASC.gov →
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Nav */}
        {(stage === 'done' || stage === 'verify') && (
          <div className="flex gap-3 mt-8">
            <button type="button" onClick={onBack}
              className="px-6 py-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:border-slate-300 transition-colors">
              ← Back
            </button>
            <button type="button" onClick={onNext}
              disabled={stage !== 'done'}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-colors">
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const OcrFields = ({ ocrData, updateOcr, inputCls }) => (
  <div className="space-y-4">
    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-900">
      We found this information on your license. Please verify everything looks correct before continuing.
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
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
        <label className="block text-xs font-medium text-slate-600 mb-1">License Type</label>
        <select value={ocrData.type} onChange={(e) => updateOcr('type', e.target.value)} className={inputCls}>
          <option value="">Select type...</option>
          {['Certified Residential','Certified General','Licensed Residential',
            'Licensed Appraiser Trainee','State Certified Appraiser','Supervisory Appraiser']
            .map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">License Number</label>
      <input type="text" value={ocrData.number} onChange={(e) => updateOcr('number', e.target.value)} className={inputCls} />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Effective Date</label>
        <input type="date" value={ocrData.effectiveDate} onChange={(e) => updateOcr('effectiveDate', e.target.value)} className={inputCls} />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">Expiration Date</label>
        <input type="date" value={ocrData.expirationDate} onChange={(e) => updateOcr('expirationDate', e.target.value)} className={inputCls} />
      </div>
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">License Address</label>
      <input type="text" value={ocrData.address} onChange={(e) => updateOcr('address', e.target.value)} className={inputCls} />
    </div>
  </div>
);

export default LicenseUpload;
