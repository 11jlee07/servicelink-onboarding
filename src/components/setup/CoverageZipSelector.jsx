import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X, Check, ChevronDown, ChevronUp, Search } from 'lucide-react';

/* ─── ZIP prefix → metro center lookup ───────────────────────────── */
const ZIP_CENTERS = {
  '100': { lat: 40.71, lng: -74.00, city: 'New York',       state: 'NY' },
  '101': { lat: 40.75, lng: -73.99, city: 'New York',       state: 'NY' },
  '112': { lat: 40.65, lng: -73.95, city: 'Brooklyn',       state: 'NY' },
  '021': { lat: 42.36, lng: -71.06, city: 'Boston',         state: 'MA' },
  '022': { lat: 42.36, lng: -71.06, city: 'Boston',         state: 'MA' },
  '191': { lat: 39.95, lng: -75.17, city: 'Philadelphia',   state: 'PA' },
  '152': { lat: 40.44, lng: -79.99, city: 'Pittsburgh',     state: 'PA' },
  '200': { lat: 38.91, lng: -77.04, city: 'Washington',     state: 'DC' },
  '202': { lat: 38.89, lng: -77.03, city: 'Washington',     state: 'DC' },
  '212': { lat: 39.29, lng: -76.61, city: 'Baltimore',      state: 'MD' },
  '282': { lat: 35.23, lng: -80.84, city: 'Charlotte',      state: 'NC' },
  '275': { lat: 35.78, lng: -78.64, city: 'Raleigh',        state: 'NC' },
  '302': { lat: 33.75, lng: -84.39, city: 'Atlanta',        state: 'GA' },
  '303': { lat: 33.75, lng: -84.39, city: 'Atlanta',        state: 'GA' },
  '322': { lat: 30.33, lng: -81.66, city: 'Jacksonville',   state: 'FL' },
  '328': { lat: 28.54, lng: -81.38, city: 'Orlando',        state: 'FL' },
  '331': { lat: 25.77, lng: -80.19, city: 'Miami',          state: 'FL' },
  '332': { lat: 25.77, lng: -80.19, city: 'Miami',          state: 'FL' },
  '336': { lat: 27.95, lng: -82.46, city: 'Tampa',          state: 'FL' },
  '352': { lat: 33.52, lng: -86.81, city: 'Birmingham',     state: 'AL' },
  '372': { lat: 36.17, lng: -86.78, city: 'Nashville',      state: 'TN' },
  '381': { lat: 35.15, lng: -90.05, city: 'Memphis',        state: 'TN' },
  '392': { lat: 32.30, lng: -90.18, city: 'Jackson',        state: 'MS' },
  '432': { lat: 39.96, lng: -82.99, city: 'Columbus',       state: 'OH' },
  '441': { lat: 41.50, lng: -81.69, city: 'Cleveland',      state: 'OH' },
  '462': { lat: 39.77, lng: -86.16, city: 'Indianapolis',   state: 'IN' },
  '482': { lat: 42.33, lng: -83.05, city: 'Detroit',        state: 'MI' },
  '606': { lat: 41.88, lng: -87.63, city: 'Chicago',        state: 'IL' },
  '631': { lat: 38.63, lng: -90.20, city: 'St. Louis',      state: 'MO' },
  '641': { lat: 39.10, lng: -94.58, city: 'Kansas City',    state: 'MO' },
  '530': { lat: 43.05, lng: -87.96, city: 'Milwaukee',      state: 'WI' },
  '551': { lat: 44.98, lng: -93.27, city: 'Minneapolis',    state: 'MN' },
  '701': { lat: 29.95, lng: -90.07, city: 'New Orleans',    state: 'LA' },
  '721': { lat: 34.75, lng: -92.29, city: 'Little Rock',    state: 'AR' },
  '730': { lat: 35.47, lng: -97.51, city: 'Oklahoma City',  state: 'OK' },
  '741': { lat: 36.15, lng: -95.99, city: 'Tulsa',          state: 'OK' },
  '750': { lat: 32.78, lng: -96.80, city: 'Dallas',         state: 'TX' },
  '761': { lat: 32.72, lng: -97.32, city: 'Fort Worth',     state: 'TX' },
  '770': { lat: 29.76, lng: -95.37, city: 'Houston',        state: 'TX' },
  '782': { lat: 29.42, lng: -98.49, city: 'San Antonio',    state: 'TX' },
  '787': { lat: 30.27, lng: -97.74, city: 'Austin',         state: 'TX' },
  '799': { lat: 31.76, lng: -106.49, city: 'El Paso',       state: 'TX' },
  '800': { lat: 39.74, lng: -104.98, city: 'Denver',        state: 'CO' },
  '841': { lat: 40.76, lng: -111.89, city: 'Salt Lake City',state: 'UT' },
  '850': { lat: 33.45, lng: -112.07, city: 'Phoenix',       state: 'AZ' },
  '871': { lat: 35.11, lng: -106.61, city: 'Albuquerque',   state: 'NM' },
  '891': { lat: 36.17, lng: -115.14, city: 'Las Vegas',     state: 'NV' },
  '897': { lat: 39.53, lng: -119.81, city: 'Reno',          state: 'NV' },
  '900': { lat: 34.05, lng: -118.24, city: 'Los Angeles',   state: 'CA' },
  '920': { lat: 32.72, lng: -117.16, city: 'San Diego',     state: 'CA' },
  '940': { lat: 37.77, lng: -122.42, city: 'San Francisco', state: 'CA' },
  '958': { lat: 38.58, lng: -121.49, city: 'Sacramento',    state: 'CA' },
  '971': { lat: 45.52, lng: -122.68, city: 'Portland',      state: 'OR' },
  '980': { lat: 47.61, lng: -122.33, city: 'Seattle',       state: 'WA' },
  '532': { lat: 43.04, lng: -76.14,  city: 'Syracuse',      state: 'NY' },
};

/* Unique metros for city search — deduplicated by city name */
const METROS = Object.values(ZIP_CENTERS)
  .filter((v, i, arr) => arr.findIndex((x) => x.city === v.city) === i)
  .sort((a, b) => a.city.localeCompare(b.city));

const DEFAULT_CENTER = { lat: 39.50, lng: -98.35, city: 'Central US', state: 'US' };
const RADIUS_OPTIONS = [50, 75, 100, 150];

/* ─── Seeded RNG (mulberry32) ─────────────────────────────────────── */
function makeRng(seed) {
  let s = seed >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 15), 1 | s);
    s ^= s + Math.imul(s ^ (s >>> 7), 61 | s);
    return ((s ^ (s >>> 14)) >>> 0) / 0x100000000;
  };
}

/* ─── Generate mock ZIPs up to maxMi ─────────────────────────────── */
function generateZips(baseZip, center, maxMi = 150, count = 45) {
  const rand = makeRng(parseInt(baseZip, 10));
  const results = [];
  const baseNum = parseInt(baseZip, 10);
  const seen = new Set([baseZip]);

  for (let i = 0; i < count; i++) {
    const angle = rand() * 2 * Math.PI;
    const t = rand();
    // Distribute across range: more density near center
    const distMi = Math.round(5 + t * t * maxMi);
    const dLat = (Math.cos(angle) * distMi) / 69;
    const dLng = (Math.sin(angle) * distMi) / 55;
    const offset = Math.floor((rand() - 0.5) * 400);
    let zip = String(Math.max(10000, Math.min(99999, baseNum + offset))).padStart(5, '0');
    if (seen.has(zip)) zip = String(Math.max(10000, Math.min(99999, baseNum + offset + 13))).padStart(5, '0');
    seen.add(zip);
    results.push({ zip, lat: center.lat + dLat, lng: center.lng + dLng, distMi, state: center.state, source: 'nearby' });
  }

  return results.sort((a, b) => a.distMi - b.distMi);
}

/* Also generate ZIPs around a given metro center (for city search) */
function generateMetroZips(metro) {
  const rand = makeRng(parseInt(metro.lat * 1000 + metro.lng * 100, 10) >>> 0);
  const results = [];
  const baseLat = metro.lat;
  const baseLng = metro.lng;
  const seen = new Set();

  for (let i = 0; i < 10; i++) {
    const angle = rand() * 2 * Math.PI;
    const distMi = Math.round(2 + rand() * 18);
    const dLat = (Math.cos(angle) * distMi) / 69;
    const dLng = (Math.sin(angle) * distMi) / 55;
    // derive a ZIP from the prefix lookup
    const prefix = Object.keys(ZIP_CENTERS).find((k) => ZIP_CENTERS[k].city === metro.city) || '100';
    const base = parseInt(prefix + '00', 10);
    const offset = Math.floor(rand() * 99);
    let zip = String(Math.max(10000, Math.min(99999, base + offset))).padStart(5, '0');
    if (seen.has(zip)) zip = String(Math.max(10000, Math.min(99999, base + offset + 7))).padStart(5, '0');
    seen.add(zip);
    results.push({ zip, lat: baseLat + dLat, lng: baseLng + dLng, distMi, state: metro.state, source: 'metro' });
  }
  return results.sort((a, b) => a.distMi - b.distMi);
}

function getCenter(zip) {
  if (!zip || zip.length < 3) return DEFAULT_CENTER;
  return ZIP_CENTERS[zip.slice(0, 3)] || ZIP_CENTERS[zip.slice(0, 2) + '0'] || DEFAULT_CENTER;
}

/* ─── Map helper: pan without zoom change ────────────────────────── */
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
  const [radius, setRadius] = useState(50);
  const [showAll, setShowAll] = useState(false);
  const [hoveredZip, setHoveredZip] = useState(null);

  // City/metro search state
  const [metroSearch, setMetroSearch] = useState('');
  const [selectedMetro, setSelectedMetro] = useState(null);
  const [metroZips, setMetroZips] = useState([]);
  const [showMetroResults, setShowMetroResults] = useState(false);

  /* All generated ZIPs up to 150mi — stable across radius changes */
  const allGenerated = useMemo(
    () => (baseZip ? generateZips(baseZip, center, 150, 45) : []),
    [baseZip]
  );

  const visibleZips = allGenerated.filter((z) => z.distMi <= radius);
  const displayZips = showAll ? visibleZips : visibleZips.slice(0, 8);
  const hasMore = visibleZips.length > 8;

  const toggle = (zip) => {
    onChange(selectedZips.includes(zip) ? selectedZips.filter((z) => z !== zip) : [...selectedZips, zip]);
  };
  const removeZip = (zip) => onChange(selectedZips.filter((z) => z !== zip));

  /* Metro search */
  const filteredMetros = metroSearch.trim().length >= 2
    ? METROS.filter((m) =>
        m.city.toLowerCase().includes(metroSearch.toLowerCase()) ||
        m.state.toLowerCase().includes(metroSearch.toLowerCase())
      ).slice(0, 6)
    : [];

  const selectMetro = (metro) => {
    setSelectedMetro(metro);
    setMetroZips(generateMetroZips(metro));
    setMetroSearch('');
    setShowMetroResults(false);
  };

  const mapCenter = [center.lat, center.lng];
  const flyTarget = hoveredZip ? [hoveredZip.lat, hoveredZip.lng] : null;

  /* ZIPs added from metro search (not in the nearby list) */
  const metroAddedZips = selectedZips.filter(
    (z) => !allGenerated.find((g) => g.zip === z) && z !== baseZip
  );

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
        <span className="text-sm text-slate-600">Your primary ZIP:</span>
        <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-full font-mono">{baseZip}</span>
        <span className="text-sm text-slate-500">{center.city}, {center.state}</span>
      </div>

      {/* Two-column: list + map */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Left: ZIP list + controls */}
        <div className="space-y-3">

          {/* Radius pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Radius:</span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setRadius(r); setShowAll(false); }}
                className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                  radius === r
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:border-blue-300 bg-white'
                }`}
              >
                {r} mi
              </button>
            ))}
            <span className="text-xs text-slate-400 ml-1">{visibleZips.length} ZIPs</span>
          </div>

          {/* ZIP checklist */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {displayZips.map((item) => {
              const checked = selectedZips.includes(item.zip);
              return (
                <label
                  key={item.zip}
                  className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                    hoveredZip?.zip === item.zip ? 'bg-blue-50' : 'hover:bg-slate-50'
                  }`}
                  onMouseEnter={() => setHoveredZip(item)}
                  onMouseLeave={() => setHoveredZip(null)}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                    checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                  }`}>
                    {checked && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <input type="checkbox" checked={checked} onChange={() => toggle(item.zip)} className="sr-only" />
                  <span className="font-mono text-sm font-semibold text-slate-800 w-14">{item.zip}</span>
                  <span className="text-xs text-slate-400">{item.state}</span>
                  <span className="ml-auto text-xs text-slate-400">{item.distMi} mi</span>
                </label>
              );
            })}

            {hasMore && (
              <button
                type="button"
                onClick={() => setShowAll((p) => !p)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100"
              >
                {showAll
                  ? <><ChevronUp className="w-3.5 h-3.5" /> Show fewer</>
                  : <><ChevronDown className="w-3.5 h-3.5" /> Show {visibleZips.length - 8} more within {radius} mi</>
                }
              </button>
            )}
          </div>

          {/* ── City/metro search ── */}
          <div className="pt-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Add ZIPs from another city
            </p>
            <p className="text-xs text-slate-400 mb-2">
              Type a city name — we'll show nearby ZIPs you can add to your coverage.
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={metroSearch}
                onChange={(e) => { setMetroSearch(e.target.value); setShowMetroResults(true); }}
                onFocus={() => setShowMetroResults(true)}
                placeholder="Search city (e.g. Austin, Chicago)"
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {/* Dropdown */}
              {showMetroResults && filteredMetros.length > 0 && (
                <div className="absolute z-10 top-full mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {filteredMetros.map((m) => (
                    <button
                      key={`${m.city}-${m.state}`}
                      type="button"
                      onMouseDown={() => selectMetro(m)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors text-left"
                    >
                      <span className="font-medium text-slate-800">{m.city}</span>
                      <span className="text-xs text-slate-400">{m.state}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ZIPs for selected metro */}
            {selectedMetro && metroZips.length > 0 && (
              <div className="mt-3 border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    ZIPs near {selectedMetro.city}, {selectedMetro.state}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setSelectedMetro(null); setMetroZips([]); }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {metroZips.map((item) => {
                  const checked = selectedZips.includes(item.zip);
                  return (
                    <label
                      key={item.zip}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                        hoveredZip?.zip === item.zip ? 'bg-blue-50' : 'hover:bg-slate-50'
                      }`}
                      onMouseEnter={() => setHoveredZip(item)}
                      onMouseLeave={() => setHoveredZip(null)}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                        checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                      }`}>
                        {checked && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                      <input type="checkbox" checked={checked} onChange={() => toggle(item.zip)} className="sr-only" />
                      <span className="font-mono text-sm font-semibold text-slate-800 w-14">{item.zip}</span>
                      <span className="text-xs text-slate-400">{item.state}</span>
                      <span className="ml-auto text-xs text-slate-400">{item.distMi} mi from {selectedMetro.city}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected chips */}
          {selectedZips.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {selectedZips.map((zip) => {
                const meta = [...allGenerated, ...metroZips].find((z) => z.zip === zip);
                return (
                  <span
                    key={zip}
                    className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-sm font-mono font-semibold px-3 py-1 rounded-full"
                    onMouseEnter={() => meta && setHoveredZip(meta)}
                    onMouseLeave={() => setHoveredZip(null)}
                  >
                    {zip}
                    <button type="button" onClick={() => removeZip(zip)} className="text-blue-400 hover:text-blue-700 transition-colors" aria-label={`Remove ${zip}`}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Leaflet map */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 h-[380px] lg:h-auto relative">
          {hoveredZip && (
            <div className="absolute top-3 left-3 z-[1000] bg-white border border-slate-200 shadow-md rounded-lg px-3 py-2 text-sm pointer-events-none">
              <span className="font-mono font-bold text-blue-700">{hoveredZip.zip}</span>
              <span className="text-slate-500 ml-2">{hoveredZip.state} · {hoveredZip.distMi} mi</span>
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {flyTarget && <MapPanTo position={flyTarget} />}

            {/* Base ZIP */}
            <CircleMarker
              center={mapCenter}
              radius={10}
              pathOptions={{ color: '#066dce', fillColor: '#066dce', fillOpacity: 1, weight: 2 }}
            >
              <Popup>{baseZip} — Your location</Popup>
            </CircleMarker>

            {/* Generated ZIPs within current radius */}
            {visibleZips.map((item) => {
              const isSelected = selectedZips.includes(item.zip);
              const isHovered = hoveredZip?.zip === item.zip;
              const pos = [item.lat, item.lng];
              return (
                <React.Fragment key={item.zip}>
                  {isSelected && (
                    <Circle
                      center={pos}
                      radius={3800}
                      pathOptions={{ color: '#16a34a', fillColor: '#22c55e', fillOpacity: 0.18, weight: 1.5, dashArray: '4 3' }}
                    />
                  )}
                  <CircleMarker
                    center={pos}
                    radius={isHovered ? 9 : isSelected ? 7 : 5}
                    pathOptions={{
                      color:       isSelected ? '#15803d' : isHovered ? '#066dce' : '#8fa0ae',
                      fillColor:   isSelected ? '#16a34a' : isHovered ? '#3b82f6' : '#bfcad5',
                      fillOpacity: isHovered ? 1 : isSelected ? 1 : 0.7,
                      weight:      isSelected ? 2 : isHovered ? 2.5 : 1.5,
                    }}
                    eventHandlers={{
                      click:     () => toggle(item.zip),
                      mouseover: () => setHoveredZip(item),
                      mouseout:  () => setHoveredZip(null),
                    }}
                  >
                    <Popup>{item.zip} · {item.distMi} mi · Click to {selectedZips.includes(item.zip) ? 'remove' : 'add'}</Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

            {/* Metro-searched ZIPs */}
            {metroZips.map((item) => {
              const isSelected = selectedZips.includes(item.zip);
              const isHovered = hoveredZip?.zip === item.zip;
              return (
                <CircleMarker
                  key={`metro-${item.zip}`}
                  center={[item.lat, item.lng]}
                  radius={isHovered ? 9 : isSelected ? 7 : 5}
                  pathOptions={{
                    color:       isSelected ? '#15803d' : '#d97706',
                    fillColor:   isSelected ? '#16a34a' : '#f59e0b',
                    fillOpacity: 0.85,
                    weight:      1.5,
                  }}
                  eventHandlers={{
                    click:     () => toggle(item.zip),
                    mouseover: () => setHoveredZip(item),
                    mouseout:  () => setHoveredZip(null),
                  }}
                >
                  <Popup>{item.zip} — {selectedMetro?.city}</Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Your ZIP</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Selected</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400 inline-block" /> Suggested</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Other city</span>
      </div>
    </div>
  );
};

export default CoverageZipSelector;
