import { useMemo, useEffect, useRef, memo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/maplibre';

const R2_BASE = 'https://data.fallcast.com';

function toFolderTimestamp(ts) {
  if (!ts || !ts.includes('T')) return ts;
  const d = new Date(ts);
  return d.getUTCFullYear()
    + String(d.getUTCMonth() + 1).padStart(2, '0')
    + String(d.getUTCDate()).padStart(2, '0')
    + String(d.getUTCHours()).padStart(2, '0');
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

  useEffect(() => {
    for (let ahead = 1; ahead <= 12; ahead++) {
      const idx = currentIndex + ahead;
      if (idx >= timestamps.length) break;
      const ts = toFolderTimestamp(timestamps[idx]);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `${R2_BASE}/flight/${ts}.png`;
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
          type='image'
          url={`${R2_BASE}/flight/${toFolderTimestamp(timestamps[idx])}.png`}
          coordinates={[
            [-20, 65],
            [ 50, 65],
            [ 50, 10],
            [-20, 10],
          ]}
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