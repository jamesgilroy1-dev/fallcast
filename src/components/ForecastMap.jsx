import { useMemo, useEffect, useRef, memo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';

const R2_BASE = 'https://pub-f1ec3d59f01543f9bfa571a675d2a038.r2.dev';

function toFolderTimestamp(ts) {
  if (!ts || !ts.includes('T')) return ts;
  const d = new Date(ts);
  return d.getUTCFullYear()
    + String(d.getUTCMonth() + 1).padStart(2, '0')
    + String(d.getUTCDate()).padStart(2, '0')
    + String(d.getUTCHours()).padStart(2, '0');
}

// Returns TMS tile coords covering bounds at zoom z.
// TMS flips the Y axis: y_tms = (2^z - 1) - y_xyz
function getTilesInBounds(bounds, z) {
  const n = Math.pow(2, z);
  const toX = (lng) => Math.floor((lng + 180) / 360 * n);
  const toY = (lat) => {
    const r = lat * Math.PI / 180;
    return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n);
  };
  const x0 = toX(bounds.getWest()),  x1 = toX(bounds.getEast());
  const y0 = toY(bounds.getNorth()), y1 = toY(bounds.getSouth());
  const tiles = [];
  for (let x = x0; x <= x1; x++)
    for (let y = y0; y <= y1; y++)
      tiles.push({ x, y: n - 1 - y, z });
  return tiles;
}

function ForecastMap({ forecastType, timestamps, currentIndex, onLocationClick }) {
  const mapRef = useRef(null);

  const windowIndices = useMemo(() => {
    const result = [];
    const start = Math.max(0, currentIndex - 1);
    const end   = Math.min(timestamps.length - 1, currentIndex + 2);
    for (let i = start; i <= end; i++) result.push(i);
    return result;
  }, [currentIndex, timestamps.length]);

  // Pre-warm the browser HTTP cache for the next 3 frames' tiles at the
  // current viewport and zoom. MapLibre's subsequent requests are served
  // from memory cache instead of the network, eliminating high-zoom lag.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const z = Math.min(Math.floor(map.getZoom()), 6);
    const tiles = getTilesInBounds(map.getBounds(), z);
    for (let ahead = 1; ahead <= 12; ahead++) {
      const idx = currentIndex + ahead;
      if (idx >= timestamps.length) break;
      const ts = toFolderTimestamp(timestamps[idx]);
      tiles.forEach(({ x, y, z: tz }) => {
        new Image().src = `${R2_BASE}/${forecastType}/${ts}/${tz}/${x}/${y}.png`;
      });
    }
  }, [currentIndex, forecastType, timestamps]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: 10, latitude: 52, zoom: 5 }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle='https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json'
      onClick={(e) => onLocationClick && onLocationClick(e.lngLat)}
    >
      {windowIndices.map(idx => (
        <Source
          key={`${forecastType}-${idx}`}
          id={`src-${forecastType}-${idx}`}
          type='raster'
          tiles={[`${R2_BASE}/${forecastType}/${toFolderTimestamp(timestamps[idx])}/{z}/{x}/{y}.png`]}
          tileSize={256}
          minzoom={4}
          maxzoom={6}
          scheme='tms'
        >
          <Layer
            id={`lyr-${forecastType}-${idx}`}
            type='raster'
            paint={{
              'raster-opacity': idx === currentIndex ? 0.75 : 0,
              'raster-opacity-transition': { duration: 0, delay: 0 },
              'raster-fade-duration': 0,
            }}
          />
        </Source>
      ))}

    </Map>
  );
}

export default memo(ForecastMap);
