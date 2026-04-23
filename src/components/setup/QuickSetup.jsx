import React, { useState, useEffect, useMemo } from 'react';
import { Check, ChevronDown, ChevronRight, MapPin, Package, DollarSign, Loader2, Building2, X } from 'lucide-react';
import zipcodes from 'zipcodes';

/* ── Data ─────────────────────────────────────────────────────────── */
const CORE_PRODUCTS = [
  { id: 'int_1004',  label: '1004 Single Family Interior' },
  { id: 'ext_2055',  label: '2055 Single Family Exterior' },
  { id: 'int_1073',  label: '1073 Condo Interior' },
  { id: 'ext_1075',  label: '1075 Condo Exterior' },
  { id: 'desk',      label: 'Desk Review' },
  { id: 'desktop',   label: 'Desktop Appraisal' },
];

const FHA_PRODUCTS = [
  { id: 'fha_int_1004', label: 'FHA 1004 Single Family Interior' },
  { id: 'fha_ext_2055', label: 'FHA 2055 Single Family Exterior' },
  { id: 'fha_int_1073', label: 'FHA 1073 Condo Interior' },
  { id: 'fha_desk',     label: 'FHA Desk Review' },
];

const FEE_GROUPS = [
  { key: 'interior', label: 'Full Interior Inspections',  placeholder: '450', hint: 'Avg. in your area: $420–$480' },
  { key: 'exterior', label: 'Exterior-Only Inspections',  placeholder: '250', hint: 'Avg. in your area: $225–$275' },
  { key: 'desktop',  label: 'Desktop / Desk Review',      placeholder: '175', hint: 'Avg. in your area: $150–$200' },
];

const RADIUS_OPTIONS = [25, 50, 75, 100, 150];

/* ── State FIPS lookups ──────────────────────────────────────────── */
const FIPS_STATE = {
  '01':'AL','02':'AK','04':'AZ','05':'AR','06':'CA','08':'CO','09':'CT','10':'DE','11':'DC','12':'FL',
  '13':'GA','15':'HI','16':'ID','17':'IL','18':'IN','19':'IA','20':'KS','21':'KY','22':'LA','23':'ME',
  '24':'MD','25':'MA','26':'MI','27':'MN','28':'MS','29':'MO','30':'MT','31':'NE','32':'NV','33':'NH',
  '34':'NJ','35':'NM','36':'NY','37':'NC','38':'ND','39':'OH','40':'OK','41':'OR','42':'PA','44':'RI',
  '45':'SC','46':'SD','47':'TN','48':'TX','49':'UT','50':'VT','51':'VA','53':'WA','54':'WV','55':'WI','56':'WY',
};

/* ── Haversine distance ──────────────────────────────────────────── */
function distanceMi(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ── Fetch nearby counties (with centroids for distance) ─────────── */
async function fetchNearbyCounties(lat, lng) {
  try {
    const deltaDeg = 2.5; // ~150 miles
    const bbox = JSON.stringify({
      xmin: lng - deltaDeg, ymin: lat - deltaDeg,
      xmax: lng + deltaDeg, ymax: lat + deltaDeg,
      spatialReference: { wkid: 4326 },
    });
    const res = await fetch(
      `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/13/query` +
      `?geometry=${encodeURIComponent(bbox)}&geometryType=esriGeometryEnvelope` +
      `&spatialRel=esriSpatialRelIntersects&outFields=NAME,STATE,GEOID,INTPTLAT,INTPTLON&f=json&resultRecordCount=120`
    );
    const json = await res.json();
    return (json.features || [])
      .map(f => {
        const cLat = parseFloat(f.attributes.INTPTLAT);
        const cLng = parseFloat(f.attributes.INTPTLON);
        const dist = (cLat && cLng) ? Math.round(distanceMi(lat, lng, cLat, cLng)) : 999;
        return {
          fips: f.attributes.GEOID,
          name: f.attributes.NAME,
          stateAbbr: FIPS_STATE[String(f.attributes.STATE).padStart(2, '0')] || '',
          distMi: dist,
        };
      })
      .sort((a, b) => a.distMi - b.distMi);
  } catch {
    return [];
  }
}

/* ── Helpers ──────────────────────────────────────────────────────── */
const formatCurrency = (val) => val.replace(/[^0-9]/g, '');

/* ── Section wrapper ──────────────────────────────────────────────── */
const Section = ({ number, icon: Icon, title, children, noPad }) => (
  <div className="bg-white rounded-exos border border-slate-200 overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
        <span className="text-white text-xs font-bold">{number}</span>
      </div>
      <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
      <h2 className="font-bold text-slate-900">{title}</h2>
    </div>
    <div className={noPad ? '' : 'px-6 py-5'}>{children}</div>
  </div>
);

/* ── Main component ───────────────────────────────────────────────── */
const QuickSetup = ({ state, setState, onBack, onDone }) => {
  /* Coverage */
  const [nearbyCounties, setNearbyCounties] = useState([]);
  const [countiesLoading, setCountiesLoading] = useState(true);
  const [selectedCounties, setSelectedCounties] = useState(new Set());
  const [radius, setRadius] = useState(50);

  /* Products */
  const [selectedProducts, setSelectedProducts] = useState(
    new Set(CORE_PRODUCTS.map((p) => p.id))
  );
  const [fhaEnabled, setFhaEnabled] = useState(false);
  const [showProducts, setShowProducts] = useState(false);

  /* Fees */
  const [fees, setFees] = useState({ interior: '', exterior: '', desktop: '' });

  const baseZip = state.basicInfo?.address?.zip || '75204';
  const baseInfo = useMemo(() => zipcodes.lookup(baseZip), [baseZip]);

  /* ── Load nearby counties on mount ───────────────────────────── */
  useEffect(() => {
    if (!baseInfo?.latitude) { setCountiesLoading(false); return; }
    setCountiesLoading(true);
    fetchNearbyCounties(baseInfo.latitude, baseInfo.longitude).then((results) => {
      setNearbyCounties(results);
      setCountiesLoading(false);
    });
  }, [baseZip]);

  /* ── Filter by radius ─────────────────────────────────────────── */
  const visibleCounties = useMemo(
    () => nearbyCounties.filter(c => c.distMi <= radius),
    [nearbyCounties, radius]
  );

  const toggleCounty = (fips) => {
    setSelectedCounties(prev => {
      const next = new Set(prev);
      next.has(fips) ? next.delete(fips) : next.add(fips);
      return next;
    });
  };

  const selectedCountyList = nearbyCounties.filter(c => selectedCounties.has(c.fips));

  /* ── Product handling ─────────────────────────────────────────── */
  const allProducts = fhaEnabled ? [...CORE_PRODUCTS, ...FHA_PRODUCTS] : CORE_PRODUCTS;

  const toggleProduct = (id) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleFha = () => {
    setFhaEnabled((prev) => {
      const next = !prev;
      if (next) {
        setSelectedProducts((p) => { const s = new Set(p); FHA_PRODUCTS.forEach(fp => s.add(fp.id)); return s; });
      } else {
        setSelectedProducts((p) => { const s = new Set(p); FHA_PRODUCTS.forEach(fp => s.delete(fp.id)); return s; });
      }
      return next;
    });
  };

  /* ── Validation ───────────────────────────────────────────────── */
  const canSave =
    selectedCounties.size > 0 &&
    selectedProducts.size > 0 &&
    fees.interior && fees.exterior && fees.desktop;

  const handleSave = () => {
    if (!canSave) return;
    setState((prev) => ({
      ...prev,
      setup: {
        coverage: { counties: selectedCountyList },
        products: { selected: [...selectedProducts], fha: fhaEnabled },
        fees,
      },
    }));
    onDone();
  };

  /* ── Render ───────────────────────────────────────────────────── */
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-slate-700 mb-6 flex items-center gap-1.5 transition-colors"
      >
        Back
      </button>

      <div className="mb-7">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Quick Setup</span>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Set Up Products, Fees and Coverage</h1>
        <p className="text-slate-500 text-sm mt-1">Takes about 2 minutes. You can refine everything later.</p>
      </div>

      <div className="space-y-4">

        {/* ── 1. Coverage ─────────────────────────────────────────── */}
        <Section number="1" icon={MapPin} title="Coverage Area" noPad>
          <div className="px-6 py-5">

            {/* Base ZIP badge */}
            {baseInfo && (
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm text-slate-600">Your primary ZIP:</span>
                <span className="bg-blue-600 text-white text-sm font-bold px-3 py-0.5 rounded-full font-mono">
                  {baseZip}
                </span>
                <span className="text-sm text-slate-500">{baseInfo.city}, {baseInfo.state}</span>
              </div>
            )}

            {/* Radius pills */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Radius:</span>
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                    radius === r
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300 bg-white'
                  }`}
                >
                  {r} mi
                </button>
              ))}
              {!countiesLoading && (
                <span className="text-xs text-slate-400">{visibleCounties.length} counties</span>
              )}
            </div>

            {/* County list */}
            {countiesLoading ? (
              <div className="flex items-center gap-2.5 py-6 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                Finding counties near you…
              </div>
            ) : visibleCounties.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">No counties found within {radius} miles.</p>
            ) : (
              <div className="border border-slate-200 rounded-exos-sm overflow-hidden mb-4">
                <div className="overflow-y-auto" style={{ maxHeight: '18rem' }}>
                  {visibleCounties.map((county) => {
                    const checked = selectedCounties.has(county.fips);
                    return (
                      <div
                        key={county.fips}
                        onMouseDown={(e) => { e.preventDefault(); toggleCounty(county.fips); }}
                        className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors select-none ${
                          checked ? 'bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                          checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                        }`}>
                          {checked && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-800 font-medium flex-1">{county.name}</span>
                        <span className="text-xs text-slate-400 flex-shrink-0">{county.stateAbbr}</span>
                        <span className="text-xs text-slate-400 flex-shrink-0 w-14 text-right">{county.distMi} mi</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected county chips */}
            {selectedCountyList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCountyList.map((county) => (
                  <span
                    key={county.fips}
                    className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full"
                  >
                    {county.name}, {county.stateAbbr}
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); toggleCounty(county.fips); }}
                      className="text-blue-400 hover:text-blue-700 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ── 2. Products ─────────────────────────────────────────── */}
        <Section number="2" icon={Package} title="Products">
          <p className="text-sm text-slate-500 mb-4">
            We've pre-selected the most common appraisal products. Adjust as needed.
          </p>

          <button
            type="button"
            onClick={toggleFha}
            className={`w-full flex items-center justify-between p-4 border-2 rounded-exos mb-4 text-left transition-all ${
              fhaEnabled ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              <p className="font-semibold text-slate-900 text-sm">I also complete FHA appraisals</p>
              <p className="text-xs text-slate-500 mt-0.5">Adds 4 FHA product variants to your panel</p>
            </div>
            <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
              fhaEnabled ? 'bg-blue-600' : 'bg-white border-2 border-slate-300'
            }`}>
              {fhaEnabled && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowProducts((p) => !p)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            aria-expanded={showProducts}
          >
            {showProducts ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            {showProducts ? 'Hide' : 'Review'} all {allProducts.length} products
            <span className="text-slate-400 font-normal">({selectedProducts.size} selected)</span>
          </button>

          {showProducts && (
            <div className="mt-3 space-y-1.5 border border-slate-100 rounded-exos-sm p-3 bg-slate-50">
              {allProducts.map((product) => {
                const checked = selectedProducts.has(product.id);
                const isFha = FHA_PRODUCTS.some((f) => f.id === product.id);
                return (
                  <div
                    key={product.id}
                    onMouseDown={(e) => { e.preventDefault(); toggleProduct(product.id); }}
                    className="flex items-center gap-3 py-2 px-2 rounded-exos hover:bg-white cursor-pointer transition-colors select-none"
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                      checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                    }`}>
                      {checked && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className="text-sm text-slate-700 flex-1">{product.label}</span>
                    {isFha && (
                      <span className="text-xs bg-amber-100 text-amber-700 font-medium px-2 py-0.5 rounded-full">FHA</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {/* ── 3. Fees ─────────────────────────────────────────────── */}
        <Section number="3" icon={DollarSign} title="Fees">
          <p className="text-sm text-slate-500 mb-5">
            Set a default fee for each inspection type. These apply to all matching products.
          </p>
          <div className="space-y-4">
            {FEE_GROUPS.map(({ key, label, placeholder, hint }) => (
              <div key={key}>
                <label className="block text-sm font-semibold text-slate-800 mb-1.5">{label}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">$</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={fees[key]}
                    onChange={(e) => setFees((prev) => ({ ...prev, [key]: formatCurrency(e.target.value) }))}
                    placeholder={placeholder}
                    className="w-full border border-slate-200 rounded-exos-sm py-3 pl-8 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={`Fee for ${label}`}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{hint}</p>
              </div>
            ))}
          </div>
        </Section>

      </div>

      {/* CTA */}
      <div className="mt-8 space-y-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold uppercase rounded-exos transition-colors"
        >
          Save & Finish
        </button>
        {!canSave && (
          <p className="text-center text-xs text-slate-400">
            Select at least one county, confirm your products, and enter all three fees to continue
          </p>
        )}
        <p className="text-center text-xs text-slate-400">
          You can update coverage, products, and fees any time from your dashboard
        </p>
      </div>
    </div>
  );
};

export default QuickSetup;
