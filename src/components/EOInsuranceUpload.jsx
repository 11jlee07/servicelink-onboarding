import React, { useState } from 'react';
import { Upload, CheckCircle, FileText, X, ShieldCheck } from 'lucide-react';

const EOInsuranceUpload = ({ state, setState, onNext, onBack }) => {
  const [file, setFile] = useState(state.eoInsurance.uploadedFile || null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setState((prev) => ({ ...prev, eoInsurance: { uploadedFile: f } }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const remove = () => {
    setFile(null);
    setState((prev) => ({ ...prev, eoInsurance: { uploadedFile: null } }));
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 6 of 8</p>
            <h1 className="text-2xl font-bold text-slate-900">E&amp;O Insurance</h1>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-6">
          Upload your current Errors &amp; Omissions insurance certificate. We'll review it to ensure you meet minimum coverage requirements.
        </p>

        {/* Requirements card */}
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-slate-800">Required coverage</span>
          </div>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Minimum <strong>$1,000,000</strong> per occurrence
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Policy must be <strong>current</strong> (not expired)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Certificate of Insurance (ACORD 25 or equivalent)
            </li>
          </ul>
        </div>

        {/* Upload zone */}
        {!file ? (
          <>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('eoFile').click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-12 text-center cursor-pointer transition-colors group"
            >
              <div className="w-16 h-16 bg-slate-100 group-hover:bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                <Upload className="w-7 h-7 text-slate-400 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-slate-700 font-medium mb-1">Drop your E&amp;O certificate here or click to browse</p>
              <p className="text-sm text-slate-400">PDF, JPG, or PNG · Max 10 MB</p>
              <input id="eoFile" type="file" accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {/* Uploaded file card */}
            <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <button type="button" onClick={remove}
                  className="text-slate-400 hover:text-red-500 transition-colors" aria-label="Remove file">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* File preview placeholder */}
            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">Preview</p>
              <div className="bg-slate-50 h-40 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">{file.name}</p>
                </div>
              </div>
            </div>

            {/* Change file */}
            <button type="button" onClick={() => document.getElementById('eoFileChange').click()}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Upload a different file
            </button>
            <input id="eoFileChange" type="file" accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
          </div>
        )}

        <div className="flex gap-3 mt-8">
          <button type="button" onClick={onBack}
            className="px-6 py-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:border-slate-300 transition-colors">
            ← Back
          </button>
          <button type="button" onClick={onNext} disabled={!file}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-colors">
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
};

export default EOInsuranceUpload;
