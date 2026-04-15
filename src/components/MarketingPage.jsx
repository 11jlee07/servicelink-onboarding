import React, { useState } from 'react';
import { CheckCircle, ArrowRight, Star, Users, TrendingUp, Shield } from 'lucide-react';
import { isValidEmail } from '../utils/validation';

const MarketingPage = ({ state, setState, onNext }) => {
  const [formData, setFormData] = useState({
    name: state.marketingData.name || '',
    email: state.marketingData.email || '',
    interest: state.marketingData.interest || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    else if (!isValidEmail(formData.email)) e.email = 'Enter a valid email address';
    if (!formData.interest) e.interest = 'Please select a service type';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setState((prev) => ({
      ...prev,
      marketingData: formData,
      accountData: { ...prev.accountData, email: formData.email },
    }));
    onNext();
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={formData[name]}
        onChange={(e) => setFormData((p) => ({ ...p, [name]: e.target.value }))}
        placeholder={placeholder}
        className={`w-full border rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
          ${errors[name] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'}`}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1.5">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
      {/* Nav */}
      <nav className="px-6 py-5 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">SL</span>
          </div>
          <span className="font-bold text-white text-lg tracking-tight">ServiceLink</span>
        </div>
        <a href="#" className="text-blue-200/80 hover:text-white text-sm transition-colors">
          Already a vendor? Sign in
        </a>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-16 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left */}
        <div className="text-white">
          <div className="inline-flex items-center gap-2 bg-blue-700/40 border border-blue-500/30 text-blue-200 rounded-full px-4 py-1.5 text-sm mb-7">
            <Star className="w-3.5 h-3.5 fill-current text-yellow-400" />
            Redesigned Onboarding
          </div>

          <h1 className="text-4xl lg:text-5xl font-extrabold mb-5 leading-tight tracking-tight">
            Join the ServiceLink
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
              Vendor Network
            </span>
          </h1>

          <p className="text-blue-100/75 text-lg mb-8 leading-relaxed max-w-md">
            Get onboarded in minutes. Access thousands of appraisal assignments
            and start earning faster with our streamlined, fully digital process.
          </p>

          <ul className="space-y-3 mb-10">
            {[
              'Real-time license verification via ASC.gov',
              'Single data entry — no re-entering information',
              'Digital signatures — no printing or mailing',
              '47+ assignments available in most service areas',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-blue-100/85 text-sm">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { icon: Users, value: '9,000+', label: 'Active Vendors' },
              { icon: TrendingUp, value: '$6,200', label: 'Avg. Monthly Earnings' },
              { icon: Shield, value: 'SOC 2', label: 'Certified Secure' },
            ].map(({ icon: Icon, value, label }, i) => (
              <div key={i}>
                <Icon className="w-5 h-5 text-blue-400 mb-1.5" />
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-blue-300/60 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Form */}
        <div>
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Start your application</h2>
            <p className="text-slate-500 text-sm mb-7">Takes about 10 minutes to complete.</p>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {field('name', 'Full Name', 'text', 'Jane Smith')}
              {field('email', 'Email Address', 'email', 'jane@example.com')}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">I'm interested in</label>
                <select
                  value={formData.interest}
                  onChange={(e) => setFormData((p) => ({ ...p, interest: e.target.value }))}
                  className={`w-full border rounded-xl py-3 px-4 text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none
                    ${errors.interest ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
                >
                  <option value="">Select a service type...</option>
                  <option value="residential">Residential Appraisals</option>
                  <option value="commercial">Commercial Appraisals</option>
                  <option value="bpo">BPO Services</option>
                  <option value="closing">Title &amp; Closing Services</option>
                </select>
                {errors.interest && <p className="text-red-500 text-xs mt-1.5">{errors.interest}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <p className="text-center text-xs text-slate-400 mt-5">
              By continuing you agree to ServiceLink's{' '}
              <a href="#" className="underline hover:text-slate-600">Terms of Service</a> and{' '}
              <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingPage;
