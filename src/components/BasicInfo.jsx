import React, { useState, useEffect } from 'react';
import { CheckCircle, MapPin, Loader } from 'lucide-react';
import { formatPhone, isValidPhone } from '../utils/validation';
import { validateAddress } from '../utils/mockApi';

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC',
  'ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'];

const BasicInfo = ({ state, setState, onNext }) => {
  const [firstName, setFirstName] = useState(state.basicInfo.firstName || '');
  const [lastName, setLastName] = useState(state.basicInfo.lastName || '');
  const [phone, setPhone] = useState(state.basicInfo.phone || '');
  const [address, setAddress] = useState(state.basicInfo.address || { street: '', city: '', stateCode: '', zip: '', validated: false });
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Auto-populate name from marketing data
  useEffect(() => {
    if (state.marketingData.name && !state.basicInfo.firstName) {
      const parts = state.marketingData.name.trim().split(/\s+/);
      const first = parts[0] || '';
      const last = parts.slice(1).join(' ') || '';
      setFirstName(first);
      setLastName(last);
    }
  }, []);

  const handleAddressField = (field, value) => {
    setAddress((prev) => ({ ...prev, [field]: value, validated: false }));
  };

  const handleValidateAddress = async () => {
    if (!address.street || !address.city || !address.stateCode || !address.zip) return;
    setValidatingAddress(true);
    try {
      await validateAddress(address);
      setAddress((prev) => ({ ...prev, validated: true }));
    } finally {
      setValidatingAddress(false);
    }
  };

  const isAddressComplete = address.street && address.city && address.stateCode && address.zip;
  const isFormValid = firstName && lastName && isValidPhone(phone) && isAddressComplete;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, phone: true, address: true });
    if (!isFormValid) return;
    setState((prev) => ({
      ...prev,
      basicInfo: { firstName, lastName, phone, address: { ...address, state: address.stateCode } },
    }));
    onNext();
  };

  const inputCls = (hasError) =>
    `w-full border rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
    ${hasError ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Step 1 of 7</p>
            <h1 className="text-2xl font-bold text-slate-900">Let's Get Started</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="firstName">
                Legal First Name
              </label>
              <div className="relative">
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, firstName: true }))}
                  className={inputCls(touched.firstName && !firstName) + (firstName ? ' pl-10' : '')}
                  required
                />
                {firstName && (
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
              {touched.firstName && !firstName && (
                <p className="text-red-500 text-xs mt-1">Required</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="lastName">
                Legal Last Name
              </label>
              <div className="relative">
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, lastName: true }))}
                  className={inputCls(touched.lastName && !lastName) + (lastName ? ' pl-10' : '')}
                  required
                />
                {lastName && (
                  <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
              {touched.lastName && !lastName && (
                <p className="text-red-500 text-xs mt-1">Required</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
              placeholder="(555) 000-0000"
              className={inputCls(touched.phone && !isValidPhone(phone))}
            />
            {touched.phone && !isValidPhone(phone) && (
              <p className="text-red-500 text-xs mt-1">Enter a valid 10-digit phone number</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Office Address
            </label>
            <div className="space-y-3">
              <input
                type="text"
                value={address.street}
                onChange={(e) => handleAddressField('street', e.target.value)}
                placeholder="Street Address"
                className={inputCls(false)}
              />
              <div className="grid grid-cols-5 gap-3">
                <input
                  type="text"
                  value={address.city}
                  onChange={(e) => handleAddressField('city', e.target.value)}
                  placeholder="City"
                  className={inputCls(false) + ' col-span-2'}
                />
                <select
                  value={address.stateCode}
                  onChange={(e) => handleAddressField('stateCode', e.target.value)}
                  className="border border-slate-200 rounded-xl py-3 px-3 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 col-span-1 text-sm"
                >
                  <option value="">ST</option>
                  {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="text"
                  value={address.zip}
                  onChange={(e) => handleAddressField('zip', e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="ZIP"
                  className={inputCls(false) + ' col-span-2'}
                  maxLength={5}
                />
              </div>
            </div>

            {/* Validate address button */}
            {isAddressComplete && !address.validated && (
              <button
                type="button"
                onClick={handleValidateAddress}
                disabled={validatingAddress}
                className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
              >
                {validatingAddress ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Validating address...</>
                ) : (
                  <><MapPin className="w-4 h-4" /> Verify address</>
                )}
              </button>
            )}
          </div>

          {/* Address verified + assignment preview */}
          {address.validated && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">Address Verified</span>
              </div>
              <p className="text-sm text-emerald-800 mb-4">
                Great news! <strong>47 assignments</strong> available near you.
                Vendors in your area earn <strong>$4,200–$8,500/month</strong>.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-emerald-100 rounded-xl p-3 shadow-sm">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Residential Appraisal</p>
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 blur-sm select-none">123 Oak Street</p>
                      <p className="text-xs text-slate-400 blur-sm select-none">Fee: $385</p>
                      <p className="text-xs text-slate-400 blur-sm select-none">Due: 04/22</p>
                    </div>
                    <p className="text-xs text-blue-600 mt-2 font-medium">Complete app to view →</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
          >
            Continue →
          </button>
        </form>
      </div>
    </div>
  );
};

export default BasicInfo;
