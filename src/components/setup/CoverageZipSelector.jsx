import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

/* ─── ZIP prefix → metro center lookup ───────────────────────────── */
const ZIP_CENTERS = {
  // Northeast
  '100': { lat: 40.71, lng: -74.00, city: 'New York', state: 'NY' },
  '101': { lat: 40.75, lng: -73.99, city: 'New York', state: 'NY' },
  '112': { lat: 40.65, lng: -73.95, city: 'Brooklyn', state: 'NY' },
  '021': { lat: 42.36, lng: -71.06, city: 'Boston', state: 'MA' },
  '022': { lat: 42.36, lng: -71.06, city: 'Boston', state: 'MA' },
  '191': { lat: 39.95, lng: -75.17, city: 'Philadelphia', state: 'PA' },
  '152': { lat: 40.44, lng: -79.99, city: 'Pittsburgh', state: 'PA' },
  // Mid-Atlantic / DC
  '200': { lat: 38.91, lng: -77.04, city: 'Washington', state: 'DC' },
  '202': { lat: 38.89, lng: -77.03, city: 'Washington', state: 'DC' },
  '212': { lat: 39.29, lng: -76.61, city: 'Baltimore', state: 'MD' },
  // Southeast
  '282': { lat: 35.23, lng: -80.84, city: 'Charlotte', state: 'NC' },
  '275': { lat: 35.78, lng: -78.64, city: 'Raleigh', state: 'NC' },
  '302': { lat: 33.75, lng: -84.39, city: 'Atlanta', state: 'GA' },
  '303': { lat: 33.75, lng: -84.39, city: 'Atlanta', state: 'GA' },
  '322': { lat: 30.33, lng: -81.66, city: 'Jacksonville', state: 'FL' },
  '328': { lat: 28.54, lng: -81.38, city: 'Orlando', state: 'FL' },
  '331': { lat: 25.77, lng: -80.19, city: 'Miami', state: 'FL' },
  '332': { lat: 25.77, lng: -80.19, city: 'Miami', state: 'FL' },
  '336': { lat: 27.95, lng: -82.46, city: 'Tampa', state: 'FL' },
  '352': { lat: 33.52, lng: -86.81, city: 'Birmingham', state: 'AL' },
  '372': { lat: 36.17, lng: -86.78, city: 'Nashville', state: 'TN' },
  '381': { lat: 35.15, lng: -90.05, city: 'Memphis', state: 'TN' },
  '392': { lat: 32.30, lng: -90.18, city: 'Jackson', state: 'MS' },
  // Midwest
  '432': { lat: 39.96, lng: -82.99, city: 'Columbus', state: 'OH' },
  '441': { lat: 41.50, lng: -81.69, city: 'Cleveland', state: 'OH' },
  '462': { lat: 39.77, lng: -86.16, city: 'Indianapolis', state: 'IN' },
  '482': { lat: 42.33, lng: -83.05, city: 'Detroit', state: 'MI' },
  '532': { lat: 43.04, lng: -76.14, city: 'Syracuse', state: 'NY' },
  '606': { lat: 41.88, lng: -87.63, city: 'Chicago', state: 'IL' },
  '607': { lat: 41.88, lng: -87.63, city: 'Chicago', state: 'IL' },
  '631': { lat: 38.63, lng: -90.20, city: 'St. Louis', state: 'MO' },
  '641': { lat: 39.10, lng: -94.58, city: 'Kansas City', state: 'MO' },
  '530': { lat: 43.05, lng: -87.96, city: 'Milwaukee', state: 'WI' },
  '551': { lat: 44.98, lng: -93.27, city: 'Minneapolis', state: 'MN' },
  // South / Texas
  '701': { lat: 29.95, lng: -90.07, city: 'New Orleans', state: 'LA' },
  '721': { lat: 34.75, lng: -92.29, city: 'Little Rock', state: 'AR' },
  '730': { lat: 35.47, lng: -97.51, city: 'Oklahoma City', state: 'OK' },
  '741': { lat: 36.15, lng: -95.99, city: 'Tulsa', state: 'OK' },
  '750': { lat: 32.78, lng: -96.80, city: 'Dallas', state: 'TX' },
  '751': { lat: 32.78, lng: -96.80, city: 'Dallas', state: 'TX' },
  '752': { lat: 32.78, lng: -96.80, city: 'Dallas', state: 'TX' },
  '761': { lat: 32.72, lng: -97.32, city: 'Fort Worth', state: 'TX' },
  '770': { lat: 29.76, lng: -95.37, city: 'Houston', state: 'TX' },
  '782': { lat: 29.42, lng: -98.49, city: 'San Antonio', state: 'TX' },
  '787': { lat: 30.27, lng: -97.74, city: 'Austin', state: 'TX' },
  '799': { lat: 31.76, lng: -106.49, city: 'El Paso', state: 'TX' },
  // Mountain / Southwest
  '800': { lat: 39.74, lng: -104.98, city: 'Denver', state: 'CO' },
  '802': { lat: 39.74, lng: -104.98, city: 'Denver', state: 'CO' },
  '841': { lat: 40.76, lng: -111.89, city: 'Salt Lake City', state: 'UT' },
  '850': { lat: 33.45, lng: -112.07, city: 'Phoenix', state: 'AZ' },
  '852': { lat: 33.45, lng: -112.07, city: 'Phoenix', state: 'AZ' },
  '871': { lat: 35.11, lng: -106.61, city: 'Albuquerque', state: 'NM' },
  '891': { lat: 36.17, lng: -115.14, city: 'Las Vegas', state: 'NV' },
  '897': { lat: 39.53, lng: -119.81, city: 'Reno', state: 'NV' },
  // West Coast
  '900': { lat: 34.05, lng: -118.24, city: 'Los Angeles', state: 'CA' },
  '901': { lat: 34.05, lng: -118.24, city: 'Los Angeles', state: 'CA' },
  '902': { lat: 33.86, lng: -118.07, city: 'Compton', state: 'CA' },
  '913': { lat: 34.28, lng: -118.45, city: 'San Fernando', state: 'CA' },
  '920': { lat: 32.72, lng: -117.16, city: 'San Diego', state: 'CA' },
  '940': { lat: 37.77, lng: -122.42, city: 'San Francisco', state: 'CA' },
  '941': { lat: 37.77, lng: -122.42, city: 'San Francisco', state: 'CA' },
  '945': { lat: 37.60, lng: -122.02, city: 'Fremont', state: 'CA' },
  '958': { lat: 38.58, lng: -121.49, city: 'Sacramento', state: 'CA' },
  '971': { lat: 45.52, lng: -122.68, city: 'Portland', state: 'OR' },
  '980': { lat: 47.61, lng: -122.33, city: 'Seattle', state: 'WA' },
  '981': { lat: 47.61, lng: -122.33, city: 'Seattle', state: 'WA' },
};

const DEFAULT_CENTER = { lat: 39.50, lng: -98.35, city: 'Central US', state: 'US' };

/* ─── Seeded RNG (mulberry32) ─────────────────────────────────────── */
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 1 | s);
    s ^= s + Math.imul(s ^ (s >>> 7), 61 | s);
    return ((s ^ (s >>> 14)) >>> 0) / 0x100000000;
  };
}

/* ─── Generate mock nearby ZIPs ───────────────────────────────────── */
function generateNearbyZips(baseZip, center) {
  const rand = makeRng(parseInt(baseZip, 10));
  const nearby = [];
  const outer = [];
  const baseNum = parseInt(baseZip, 10);
  const seen = new Set([baseZip]);

  for (let i = 0; i < 22; i++) {
    const angle = rand() * 2 * Math.PI;
    const rawDist = rand(); // 0–1
    // Map to 0–80 miles, skewed towards closer
    const distMi = rawDist < 0.7
      ? rawDist * (50 / 0.7)          // 0–50 mi for first 70%
      : 50 + (rawDist - 0.7) * (100); // 50–80 mi for remaining

    const dLat = (Math.cos(angle) * distMi) / 69;
    const dLng = (Math.sin(angle) * distMi) / 55;

    // Generate a plausible ZIP near base
    const offset = Math.floor((rand() - 0.5) * 300);
    let zip = String(Math.max(10000, Math.min(99999, baseNum + offset))).padStart(5, '0');
    if (seen.has(zip)) zip = String(Math.max(10000, Math.min(99999, baseNum + offset + 11))).padStart(5, '0');
    seen.add(zip);

    const item = {
      zip,
      lat: center.lat + dLat,
      lng: center.lng + dLng,
      distMi: Math.round(distMi),
      state: center.state,
    };

    if (distMi <= 50) nearby.push(item);
    else outer.push(item);
  }

  nearby.sort((a, b) => a.distMi - b.distMi);
  outer.sort((a, b) => a.distMi - b.distMi);
  return { nearby, outer };
}

function getCenter(zip) {
  if (!zip || zip.length < 3) return DEFAULT_CENTER;
  return (
    ZIP_CENTERS[zip.slice(0, 3)] ||
    ZIP_CENTERS[zip.slice(0, 2) + '0'] ||
    DEFAULT_CENTER
  );
}

/* ─── Map helper: pan to hovered ZIP (no zoom change) ────────────── */
const MapPanTo = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo(position, { animate: true, duration: 0.35 });
  }, [position, map]);
  return null;
};

/* ─── Main component ──────────────────────────────────────────────── */
const CoverageZipSelector = ({ baseZip, selectedZips, onChange }) => {
  const center = getCenter(baseZip);
  const { nearby, outer } = React.useMemo(
    () => (baseZip ? generateNearbyZips(baseZip, center) : { nearby: [], outer: [] }),
    [baseZip]
  );

  const [showAllNearby, setShowAllNearby] = useState(false);
  const [hoveredZip, setHoveredZip] = useState(null);
  const [outerInput, setOuterInput] = useState('');
  const [outerError, setOuterError] = useState('');

  const visibleNearby = showAllNearby ? nearby : nearby.slice(0, 8);

  const toggle = (zip) => {
    const next = selectedZips.includes(zip)
      ? selectedZips.filter((z) => z !== zip)
      : [...selectedZips, zip];
    onChange(next);
  };

  const addOuter = () => {
    const zip = outerInput.trim();
    if (zip.length !== 5 || !/^\d{5}$/.test(zip)) {
      setOuterError('Enter a valid 5-digit ZIP');
      return;
    }
    if (selectedZips.includes(zip)) {
      setOuterError('Already added');
      return;
    }
    onChange([...selectedZips, zip]);
    setOuterInput('');
    setOuterError('');
  };

  const removeZip = (zip) => onChange(selectedZips.filter((z) => z !== zip));

  const mapCenter = [center.lat, center.lng];
  const flyTarget = hoveredZip ? [hoveredZip.lat, hoveredZip.lng] : null;

  const allSuggested = [...nearby, ...outer];

  if (!baseZip) {
    return (
      <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        Complete your office address in Step 1 to see nearby ZIP code suggestions.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Primary ZIP badge */}
      <div className="flex items-center gap-2.5">
        <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <span className="text-sm text-slate-600">Your primary location:</span>
        <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full font-mono">
          {baseZip}
        </span>
        <span className="text-sm text-slate-500">{center.city}, {center.state}</span>
      </div>

      {/* Two-column: list + map */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Left: ZIP checklist */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Suggested ZIPs within ~50 miles ({nearby.length})
          </p>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {visibleNearby.map((item) => {
              const checked = selectedZips.includes(item.zip);
              return (
                <label
                  key={item.zip}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                    hoveredZip?.zip === item.zip ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                  onMouseEnter={() => setHoveredZip(item)}
                  onMouseLeave={() => setHoveredZip(null)}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                      checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                    }`}
                  >
                    {checked && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <input type="checkbox" checked={checked} onChange={() => toggle(item.zip)} className="sr-only" />
                  <span className="font-mono text-sm font-semibold text-slate-800 w-14">{item.zip}</span>
                  <span className="text-xs text-slate-400">{item.state}</span>
                  <span className="ml-auto text-xs text-slate-400">{item.distMi} mi</span>
                </label>
              );
            })}

            {nearby.length > 8 && (
              <button
                type="button"
                onClick={() => setShowAllNearby((p) => !p)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100"
              >
                {showAllNearby
                  ? <><ChevronUp className="w-3.5 h-3.5" /> Show less</>
                  : <><ChevronDown className="w-3.5 h-3.5" /> Show {nearby.length - 8} more</>
                }
              </button>
            )}
          </div>

          {/* Outside radius section */}
          <div className="pt-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Outside this radius
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={outerInput}
                onChange={(e) => { setOuterInput(e.target.value.replace(/\D/g, '').slice(0, 5)); setOuterError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && addOuter()}
                placeholder="Enter ZIP code"
                maxLength={5}
                className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addOuter}
                disabled={outerInput.length !== 5}
                className="flex items-center gap-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
            {outerError && <p className="text-red-500 text-xs mt-1">{outerError}</p>}
          </div>

          {/* All selected chips */}
          {selectedZips.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedZips.map((zip) => {
                const meta = allSuggested.find((z) => z.zip === zip);
                return (
                  <span
                    key={zip}
                    className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-sm font-mono font-semibold px-3 py-1 rounded-full"
                    onMouseEnter={() => meta && setHoveredZip(meta)}
                    onMouseLeave={() => setHoveredZip(null)}
                  >
                    {zip}
                    <button
                      type="button"
                      onClick={() => removeZip(zip)}
                      className="text-blue-400 hover:text-blue-700 transition-colors"
                      aria-label={`Remove ${zip}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Leaflet map */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 h-[340px] lg:h-auto relative">
          {hoveredZip && (
            <div className="absolute top-3 left-3 z-[1000] bg-white border border-slate-200 shadow-md rounded-lg px-3 py-2 text-sm pointer-events-none">
              <span className="font-mono font-bold text-blue-700">{hoveredZip.zip}</span>
              <span className="text-slate-500 ml-2">{hoveredZip.state} · {hoveredZip.distMi} mi away</span>
            </div>
          )}
          <MapContainer
            center={mapCenter}
            zoom={8}
            style={{ height: '100%', width: '100%', minHeight: 280 }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {flyTarget && <MapPanTo position={flyTarget} />}

            {/* Base ZIP — large blue dot */}
            <CircleMarker
              center={mapCenter}
              radius={10}
              pathOptions={{ color: '#066dce', fillColor: '#066dce', fillOpacity: 1, weight: 2 }}
            >
              <Popup>{baseZip} — Your location</Popup>
            </CircleMarker>

            {/* Nearby ZIPs — area fill for selected, dot for unselected */}
            {nearby.map((item) => {
              const isSelected = selectedZips.includes(item.zip);
              const isHovered = hoveredZip?.zip === item.zip;
              const pos = [item.lat, item.lng];
              return (
                <React.Fragment key={item.zip}>
                  {/* Coverage area circle (only when selected) */}
                  {isSelected && (
                    <Circle
                      center={pos}
                      radius={3800}
                      pathOptions={{
                        color: '#16a34a',
                        fillColor: '#22c55e',
                        fillOpacity: 0.18,
                        weight: 1.5,
                        dashArray: '4 3',
                      }}
                    />
                  )}
                  {/* Dot marker */}
                  <CircleMarker
                    center={pos}
                    radius={isHovered ? 9 : isSelected ? 7 : 5}
                    pathOptions={{
                      color: isSelected ? '#15803d' : isHovered ? '#066dce' : '#8fa0ae',
                      fillColor: isSelected ? '#16a34a' : isHovered ? '#3b82f6' : '#bfcad5',
                      fillOpacity: isHovered ? 1 : isSelected ? 1 : 0.7,
                      weight: isSelected ? 2 : isHovered ? 2.5 : 1.5,
                    }}
                    eventHandlers={{
                      click: () => toggle(item.zip),
                      mouseover: () => setHoveredZip(item),
                      mouseout: () => setHoveredZip(null),
                    }}
                  >
                    <Popup>{item.zip} · {item.distMi} mi away · Click to {selectedZips.includes(item.zip) ? 'remove' : 'add'}</Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

            {/* Outer ZIPs (manually added) shown dimmer */}
            {selectedZips
              .filter((z) => !nearby.find((n) => n.zip === z) && z !== baseZip)
              .map((zip) => {
                const meta = outer.find((o) => o.zip === zip);
                if (!meta) return null;
                return (
                  <CircleMarker
                    key={zip}
                    center={[meta.lat, meta.lng]}
                    radius={6}
                    pathOptions={{ color: '#f9a824', fillColor: '#f9a824', fillOpacity: 0.7, weight: 1.5 }}
                  >
                    <Popup>{zip} — Added manually</Popup>
                  </CircleMarker>
                );
              })}
          </MapContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Your ZIP</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400 inline-block" /> Suggested</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Added manually</span>
      </div>
    </div>
  );
};

export default CoverageZipSelector;
