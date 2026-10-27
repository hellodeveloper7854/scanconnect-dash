import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, MapPin, ExternalLink, RefreshCw } from 'lucide-react';
import {
  NEARBY_CATEGORIES,
  NearbyResult,
  getBrowserLocation,
  getCached,
  getStale,
  mapsPlaceUrl,
  mapsSearchUrl,
  searchNearby,
} from '../lib/nearbySearch';

type Status = 'idle' | 'locating' | 'searching' | 'done' | 'error';

export const NearbySearchPanel: React.FC<{ categoryId: string }> = ({ categoryId }) => {
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<NearbyResult | null>(null);
  const [stale, setStale] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const run = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setError('');
    setStale(false);
    setResult(null);
    setStatus('locating');
    let loc: { lat: number; lon: number };
    try {
      loc = await getBrowserLocation();
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError(e instanceof Error ? e.message : 'Could not get your location.');
      setStatus('error');
      return;
    }
    if (ctrl.signal.aborted) return;

    const cached = getCached(categoryId, loc.lat, loc.lon);
    if (cached) {
      setResult(cached);
      setStatus('done');
      return;
    }
    setStatus('searching');
    try {
      const r = await searchNearby(categoryId, loc.lat, loc.lon, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setResult(r);
      setStatus('done');
    } catch {
      if (ctrl.signal.aborted) return;
      const old = getStale(categoryId, loc.lat, loc.lon);
      if (old) {
        setResult(old);
        setStale(true);
        setError('Could not refresh results. Showing earlier results.');
        setStatus('done');
      } else {
        setError('The map service did not respond in time. Please retry, or search in Google Maps.');
        setStatus('error');
      }
    }
  }, [categoryId]);

  const cat = NEARBY_CATEGORIES[categoryId];
  if (!cat) return null;

  const busy = status === 'locating' || status === 'searching';

  return (
    <div className="space-y-3" aria-live="polite">
      {status === 'idle' && (
        <button
          onClick={run}
          className="w-full py-3 bg-[#FFED00] text-neutral-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          <MapPin className="w-4 h-4" /> Search Nearby
        </button>
      )}

      {busy && (
        <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl p-3">
          <Loader2 className="w-4 h-4 animate-spin" />
          {status === 'locating' ? 'Getting your location…' : 'Searching nearby places…'}
        </div>
      )}

      {status === 'error' && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2 text-sm text-red-800">
          <p>{error}</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={run}
              className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
            <a
              href={mapsSearchUrl(categoryId)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-800 text-xs font-bold rounded-lg flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Search in Google Maps
            </a>
          </div>
        </div>
      )}

      {status === 'done' && result && (
        <>
          {stale && (
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
              {error} (from {new Date(result.fetchedAt).toLocaleTimeString()})
            </p>
          )}
          {result.places.length === 0 ? (
            <div className="text-sm text-neutral-600 bg-neutral-50 border border-neutral-200 rounded-xl p-3 space-y-2">
              <p>No {cat.label.toLowerCase()} found within {result.radiusM / 1000} km on OpenStreetMap.</p>
              <a
                href={mapsSearchUrl(categoryId)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold underline"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Search in Google Maps
              </a>
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {result.places.map((p) => (
                <li key={p.id} className="border border-neutral-200 rounded-xl p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-neutral-900 truncate">{p.name}</p>
                    <p className="text-xs text-neutral-500">
                      {p.distanceKm.toFixed(1)} km away
                      {p.open24x7 && <span className="ml-2 text-emerald-600 font-bold">Open 24/7</span>}
                    </p>
                  </div>
                  <a
                    href={mapsPlaceUrl(p.lat, p.lon)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-bold text-neutral-900 bg-[#FFED00] px-3 py-1.5 rounded-lg"
                  >
                    Open in Maps
                  </a>
                </li>
              ))}
            </ul>
          )}
          <button onClick={run} className="text-xs text-neutral-500 hover:text-neutral-900 underline cursor-pointer">
            Refresh
          </button>
          <p className="text-[10px] text-neutral-400">Data © OpenStreetMap contributors. Coverage may vary.</p>
        </>
      )}
    </div>
  );
};
