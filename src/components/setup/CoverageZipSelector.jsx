import React, { useState, useMemo, useEffect, useCallback } from 'react';
import zipcodes from 'zipcodes';
import { MapContainer, TileLayer, CircleMarker, GeoJSON, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, X, Check, ChevronDown, ChevronUp, Search, Loader } from 'lucide-react';

/* ─── Haversine distance in miles ────────────────────────────────── */
function distanceMi(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── Get real nearby ZIPs from zipcodes package ─────────────────── */
function getNearbyZips(baseZip, maxMi = 150) {
  const base = zipcodes.lookup(baseZip);
  if (!base) return [];

  const candidates = zipcodes.radius(baseZip, maxMi);
  return candidates
    .map((zip) => {
      const info = zipcodes.lookup(zip);
      if (!info || !info.latitude) return null;
      const dist = Math.round(distanceMi(base.latitude, base.longitude, info.latitude, info.longitude));
      return { zip, lat: info.latitude, lng: info.longitude, city: info.city, state: info.state, distMi: dist };
    })
    .filter(Boolean)
    .sort((a, b) => a.distMi - b.distMi)
    .slice(0, 120); // cap for performance
}

/* ─── Fetch ZIP boundary polygon from Census TIGER API ───────────── */
async function fetchZipBoundary(zip) {
  // Try multiple TIGER service layers — field name and layer number vary by vintage
  const attempts = [
    `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGISWeb/tigerWMS_ACS2023/MapServer/1/query?where=ZCTA5CE20%3D'${zip}'&outFields=ZCTA5CE20&outSR=4326&f=geojson`,
    `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGISWeb/tigerWMS_Current/MapServer/2/query?where=ZCTA5CE10%3D'${zip}'&outFields=ZCTA5CE10&outSR=4326&f=geojson`,
    `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGISWeb/tigerWMS_ACS2023/MapServer/1/query?where=GEOID%3D'${zip}'&outFields=GEOID&outSR=4326&f=geojson`,
  ];

  for (const url of attempts) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const feature = data?.features?.[0];
      if (feature?.geometry) {
        // Return a proper GeoJSON Feature so react-leaflet GeoJSON renders it
        return { type: 'Feature', geometry: feature.geometry, properties: { zip } };
      }
    } catch (e) {
      console.warn(`TIGER fetch failed for ${zip}:`, e);
    }
  }

  console.warn(`No boundary found for ZIP ${zip}`);
  return null;
}

/* ─── Metro list for city search (deduplicated) ───────────────────── */
const METRO_PREFIXES = [
  '100','021','191','200','212','282','302','322','328','331','336',
  '372','432','441','462','482','606','641','530','551','701','730',
  '750','770','782','787','800','841','850','871','891','900','920',
  '940','958','971','980',
];
const METROS = METRO_PREFIXES
  .map((p) => zipcodes.lookup(p + '00') || zipcodes.lookup(p + '01'))
  .filter(Boolean)
  .filter((v, i, arr) => arr.findIndex((x) => x.city === v.city) === i)
  .map((v) => ({ zip: v.zip, city: v.city, state: v.state, lat: v.latitude, lng: v.longitude }))
  .sort((a, b) => a.city.localeCompare(b.city));

const RADIUS_OPTIONS = [25, 50, 75, 100, 150];

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
  const baseInfo = useMemo(() => zipcodes.lookup(baseZip) || null, [baseZip]);

  /* All real nearby ZIPs within 150mi — computed once */
  const allZips = useMemo(() => getNearbyZips(baseZip, 150), [baseZip]);

  const [radius, setRadius] = useState(50);
  const [showAll, setShowAll] = useState(false);
  const [hoveredZip, setHoveredZip] = useState(null);

  /* ZIP boundary cache: { [zip]: GeoJSON Feature | 'loading' | 'error' } */
  const [boundaries, setBoundaries] = useState({});

  /* City search */
  const [metroSearch, setMetroSearch] = useState('');
  const [activeMetro, setActiveMetro] = useState(null);
  const [metroZips, setMetroZips] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const visibleZips = useMemo(
    () => allZips.filter((z) => z.distMi <= radius),
    [allZips, radius]
  );
  const displayZips = showAll ? visibleZips : visibleZips.slice(0, 10);

  /* ── Toggle selection + trigger boundary fetch ── */
  const toggle = useCallback((zip) => {
    const next = selectedZips.includes(zip)
      ? selectedZips.filter((z) => z !== zip)
      : [...selectedZips, zip];
    onChange(next);

    // Fetch boundary if newly selected and not yet cached
    if (!selectedZips.includes(zip) && !boundaries[zip]) {
      setBoundaries((prev) => ({ ...prev, [zip]: 'loading' }));
      fetchZipBoundary(zip)
        .then((geom) => setBoundaries((prev) => ({ ...prev, [zip]: geom || 'error' })))
        .catch(() => setBoundaries((prev) => ({ ...prev, [zip]: 'error' })));
    }
  }, [selectedZips, onChange, boundaries]);

  const removeZip = (zip) => onChange(selectedZips.filter((z) => z !== zip));

  /* ── Metro search ── */
  const filteredMetros = metroSearch.trim().length >= 2
    ? METROS.filter(
        (m) =>
          m.city.toLowerCase().includes(metroSearch.toLowerCase()) ||
          m.state.toLowerCase().includes(metroSearch.toLowerCase())
      ).slice(0, 6)
    : [];

  const selectMetro = (metro) => {
    setActiveMetro(metro);
    const nearby = getNearbyZips(metro.zip, 30);
    setMetroZips(nearby.slice(0, 12));
    setMetroSearch('');
    setShowDropdown(false);
  };

  const mapCenter = baseInfo ? [baseInfo.latitude, baseInfo.longitude] : [39.5, -98.35];
  const flyTarget = hoveredZip ? [hoveredZip.lat, hoveredZip.lng] : null;

  const allDisplayed = [...visibleZips, ...metroZips];

  if (!baseZip || !baseInfo) {
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
        <span className="text-sm text-slate-500">{baseInfo.city}, {baseInfo.state}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">

        {/* ── Left: ZIP list ── */}
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
            <span className="text-xs text-slate-400">{visibleZips.length} ZIPs</span>
          </div>

          {/* Nearby ZIP checklist */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            {displayZips.map((item) => {
              const checked = selectedZips.includes(item.zip);
              const isLoading = boundaries[item.zip] === 'loading';
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
                    {checked && !isLoading && <Check className="w-2.5 h-2.5 text-white" />}
                    {checked && isLoading && <Loader className="w-2.5 h-2.5 text-white animate-spin" />}
                  </div>
                  <input type="checkbox" checked={checked} onChange={() => toggle(item.zip)} className="sr-only" />
                  <span className="font-mono text-sm font-semibold text-slate-800 w-14">{item.zip}</span>
                  <span className="text-xs text-slate-500">{item.city}, {item.state}</span>
                  <span className="ml-auto text-xs text-slate-400 flex-shrink-0">{item.distMi} mi</span>
                </label>
              );
            })}

            {visibleZips.length > 10 && (
              <button
                type="button"
                onClick={() => setShowAll((p) => !p)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors border-t border-slate-100"
              >
                {showAll
                  ? <><ChevronUp className="w-3.5 h-3.5" /> Show fewer</>
                  : <><ChevronDown className="w-3.5 h-3.5" /> Show {visibleZips.length - 10} more within {radius} mi</>}
              </button>
            )}
          </div>

          {/* City/metro search */}
          <div className="pt-1 space-y-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Add ZIPs from another city</p>
              <p className="text-xs text-slate-400">Search a city — we'll show real ZIPs near it.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={metroSearch}
                onChange={(e) => { setMetroSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="e.g. Austin, Chicago, Miami"
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {showDropdown && filteredMetros.length > 0 && (
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

            {/* Metro ZIPs */}
            {activeMetro && metroZips.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    ZIPs near {activeMetro.city}, {activeMetro.state}
                  </span>
                  <button type="button" onClick={() => { setActiveMetro(null); setMetroZips([]); }} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                {metroZips.map((item) => {
                  const checked = selectedZips.includes(item.zip);
                  const isLoading = boundaries[item.zip] === 'loading';
                  return (
                    <label
                      key={item.zip}
                      className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-slate-100 last:border-b-0 transition-colors ${
                        hoveredZip?.zip === item.zip ? 'bg-amber-50' : 'hover:bg-slate-50'
                      }`}
                      onMouseEnter={() => setHoveredZip(item)}
                      onMouseLeave={() => setHoveredZip(null)}
                    >
                      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                        checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                      }`}>
                        {checked && !isLoading && <Check className="w-2.5 h-2.5 text-white" />}
                        {checked && isLoading && <Loader className="w-2.5 h-2.5 text-white animate-spin" />}
                      </div>
                      <input type="checkbox" checked={checked} onChange={() => toggle(item.zip)} className="sr-only" />
                      <span className="font-mono text-sm font-semibold text-slate-800 w-14">{item.zip}</span>
                      <span className="text-xs text-slate-500">{item.city}</span>
                      <span className="ml-auto text-xs text-slate-400 flex-shrink-0">{item.distMi} mi from {activeMetro.city}</span>
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
                const meta = allDisplayed.find((z) => z.zip === zip);
                return (
                  <span
                    key={zip}
                    className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 text-sm font-mono font-semibold px-3 py-1 rounded-full"
                    onMouseEnter={() => meta && setHoveredZip(meta)}
                    onMouseLeave={() => setHoveredZip(null)}
                  >
                    {zip}
                    <button type="button" onClick={() => removeZip(zip)} className="text-blue-400 hover:text-blue-700 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Map ── */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 h-[420px] lg:h-auto relative">
          {hoveredZip && (
            <div className="absolute top-3 left-3 z-[1000] bg-white border border-slate-200 shadow-md rounded-lg px-3 py-2 text-sm pointer-events-none">
              <span className="font-mono font-bold text-blue-700">{hoveredZip.zip}</span>
              <span className="text-slate-500 ml-2">{hoveredZip.city}, {hoveredZip.state} · {hoveredZip.distMi} mi</span>
            </div>
          )}
          <MapContainer
            center={mapCenter}
            zoom={9}
            style={{ height: '100%', width: '100%', minHeight: 300 }}
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
              <Popup>{baseZip} — {baseInfo.city}, {baseInfo.state}</Popup>
            </CircleMarker>

            {/* Nearby ZIP dots + boundaries */}
            {visibleZips.map((item) => {
              const isSelected = selectedZips.includes(item.zip);
              const isHovered = hoveredZip?.zip === item.zip;
              const boundary = boundaries[item.zip];
              const pos = [item.lat, item.lng];

              return (
                <React.Fragment key={item.zip}>
                  {/* Real polygon boundary when loaded */}
                  {isSelected && boundary && boundary !== 'loading' && boundary !== 'error' && (
                    <GeoJSON
                      key={`boundary-${item.zip}-loaded`}
                      data={boundary}
                      style={() => ({
                        color: '#2563eb',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.12,
                        weight: 2.5,
                        dashArray: '6 4',
                      })}
                    />
                  )}
                  {/* Dot marker */}
                  <CircleMarker
                    center={pos}
                    radius={isHovered ? 9 : isSelected ? 7 : 4}
                    pathOptions={{
                      color:       isSelected ? '#15803d' : isHovered ? '#066dce' : '#8fa0ae',
                      fillColor:   isSelected ? '#16a34a' : isHovered ? '#3b82f6' : '#bfcad5',
                      fillOpacity: isHovered ? 1 : isSelected ? 1 : 0.6,
                      weight:      isSelected ? 2 : isHovered ? 2.5 : 1,
                    }}
                    eventHandlers={{
                      click:     () => toggle(item.zip),
                      mouseover: () => setHoveredZip(item),
                      mouseout:  () => setHoveredZip(null),
                    }}
                  >
                    <Popup>{item.zip} — {item.city}, {item.state} · {item.distMi} mi</Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

            {/* Metro-searched ZIP dots */}
            {metroZips.filter((m) => !visibleZips.find((v) => v.zip === m.zip)).map((item) => {
              const isSelected = selectedZips.includes(item.zip);
              const isHovered = hoveredZip?.zip === item.zip;
              const boundary = boundaries[item.zip];
              return (
                <React.Fragment key={`metro-${item.zip}`}>
                  {isSelected && boundary && boundary !== 'loading' && boundary !== 'error' && (
                    <GeoJSON
                      key={`mboundary-${item.zip}-loaded`}
                      data={boundary}
                      style={() => ({ color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.2, weight: 2 })}
                    />
                  )}
                  <CircleMarker
                    center={[item.lat, item.lng]}
                    radius={isHovered ? 9 : isSelected ? 7 : 5}
                    pathOptions={{
                      color:       isSelected ? '#15803d' : '#d97706',
                      fillColor:   isSelected ? '#16a34a' : '#f59e0b',
                      fillOpacity: 0.85,
                      weight: 1.5,
                    }}
                    eventHandlers={{
                      click:     () => toggle(item.zip),
                      mouseover: () => setHoveredZip(item),
                      mouseout:  () => setHoveredZip(null),
                    }}
                  >
                    <Popup>{item.zip} — {item.city}</Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Your ZIP</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Selected (boundary loaded)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-400 inline-block" /> Suggested</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Other city</span>
      </div>
    </div>
  );
};

export default CoverageZipSelector;
