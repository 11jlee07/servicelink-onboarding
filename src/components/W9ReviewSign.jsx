import React, { useRef, useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';

const W9ReviewSign = ({ state, setState, onNext, onBack }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [showCertInfo, setShowCertInfo] = useState(false);

  const getPos = (canvas, e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const { x, y } = getPos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(canvas, e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSubmit = () => {
    setState((prev) => ({
      ...prev,
      w9Signature: {
        signatureData: canvasRef.current.toDataURL(),
        signedAt: new Date().toISOString(),
      },
    }));
    onNext();
  };

  const { basicInfo, w9Data, businessStructure } = state;
  const addr = w9Data.mailingAddress.useOfficeAddress
    ? basicInfo.address
    : w9Data.mailingAddress;

  const classLabel = () => {
    if (businessStructure === 'sole_prop') return 'Individual / Sole Proprietor';
    if (businessStructure === 'single_llc') return `Limited Liability Company (${w9Data.taxClassification || 'disregarded'})`;
    if (businessStructure === 'multi_llc') return `Limited Liability Company (${w9Data.taxClassification || 'partnership'})`;
    if (businessStructure === 'partnership') return 'Partnership';
    if (businessStructure === 'corporation') return `${w9Data.taxClassification === 's_corp' ? 'S' : 'C'} Corporation`;
    if (businessStructure === 'trust') return 'Trust / Estate';
    return 'Other';
  };

  const maskedId = w9Data.taxId
    ? w9Data.taxId.slice(0, -4).replace(/\d/g, '•') + w9Data.taxId.slice(-4)
    : '';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 4 of 7</p>
            <h1 className="text-2xl font-bold text-slate-900">Review Your W-9</h1>
          </div>
        </div>

        <p className="text-slate-500 text-sm mb-6">
          Please review the information below before signing. You can go back to make changes.
        </p>

        {/* W-9 Preview */}
        <div className="mb-6 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Form W-9 Preview</span>
            <span className="text-xs text-slate-400">Request for Taxpayer Identification Number</span>
          </div>
          <div className="p-6 max-h-80 overflow-y-auto bg-white">
            <div className="space-y-4 text-sm font-mono">
              <div>
                <span className="text-xs font-sans font-medium text-slate-400 uppercase tracking-wide">Line 1 · Name</span>
                <p className="text-slate-900 mt-0.5">{basicInfo.firstName} {basicInfo.lastName}</p>
              </div>

              {w9Data.businessName && (
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-xs font-sans font-medium text-slate-400 uppercase tracking-wide">Line 2 · Business Name</span>
                  <p className="text-slate-900 mt-0.5">{w9Data.businessName}</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <span className="text-xs font-sans font-medium text-slate-400 uppercase tracking-wide">Line 3 · Tax Classification</span>
                <p className="text-slate-900 mt-0.5">☑ {classLabel()}</p>
              </div>

              {w9Data.foreignMembers !== null && (
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-xs font-sans font-medium text-slate-400 uppercase tracking-wide">Line 3b · Foreign Members / Partners</span>
                  <p className="text-slate-900 mt-0.5">{w9Data.foreignMembers ? '☑ Yes' : '☐ No'}</p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4">
                <span className="text-xs font-sans font-medium text-slate-400 uppercase tracking-wide">Lines 5–6 · Address</span>
                <p className="text-slate-900 mt-0.5">
                  {addr.street}<br />
                  {addr.city}{addr.city && ','} {addr.state || addr.stateCode} {addr.zip}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <span className="text-xs font-sans font-medium text-slate-400 uppercase tracking-wide">Part I · Taxpayer Identification Number</span>
                <p className="text-slate-900 mt-0.5">
                  {w9Data.taxIdType === 'ssn' ? 'SSN:' : 'EIN:'} {maskedId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Certification */}
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <h3 className="font-semibold text-slate-900 mb-3 text-sm">By signing below, you certify that:</h3>
          <ul className="space-y-1.5 text-sm text-slate-600">
            <li>• The tax information shown above is accurate and complete</li>
            <li>• You are a U.S. person (citizen or resident alien)</li>
            <li>• You are not subject to backup withholding (or are exempt)</li>
          </ul>

          <button type="button" onClick={() => setShowCertInfo(!showCertInfo)}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 mt-3">
            <Info className="w-3.5 h-3.5" />
            What am I certifying?
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCertInfo ? 'rotate-180' : ''}`} />
          </button>
          {showCertInfo && (
            <div className="mt-3 p-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-600">
              You're confirming that the tax information is accurate and that you're authorized to provide it.
              This is the standard IRS requirement for all independent contractors under penalty of perjury.
            </div>
          )}
        </div>

        {/* Signature canvas */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">
              Sign here (use your mouse or finger)
            </label>
            {hasSignature && (
              <button type="button" onClick={clearSignature}
                className="text-xs text-slate-500 hover:text-red-500 transition-colors">
                Clear signature
              </button>
            )}
          </div>

          <div className={`border-2 rounded-xl overflow-hidden transition-all ${hasSignature ? 'border-blue-400' : 'border-slate-300'}`}>
            <canvas
              ref={canvasRef}
              width={700}
              height={140}
              className="w-full cursor-crosshair signature-canvas bg-white"
              style={{ touchAction: 'none' }}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={endDraw}
            />
          </div>

          {!hasSignature && (
            <p className="text-xs text-slate-400 mt-1.5 text-center">
              Draw your signature above to proceed
            </p>
          )}
        </div>

        {/* Date */}
        <p className="text-sm text-slate-500 mb-8">
          Date: <strong>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
        </p>

        <div className="flex gap-3">
          <button type="button" onClick={onBack}
            className="px-6 py-3 border-2 border-slate-200 rounded-xl font-medium text-slate-700 hover:border-slate-300 transition-colors">
            ← Back to Edit
          </button>
          <button type="button" onClick={handleSubmit} disabled={!hasSignature}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-xl transition-colors">
            Sign &amp; Continue →
          </button>
        </div>
      </div>
    </div>
  );
};

export default W9ReviewSign;
