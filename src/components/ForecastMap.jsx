import Map, { Source, Layer } from 'react-map-gl/maplibre';

// Replace with your actual R2 public URL
const R2_BASE = 'https://pub-f1ec3d59f01543f9bfa571a675d2a038.r2.dev';

function ForecastMap() {
  // Replace with your actual forecast type folder name
  const forecastType = 'flight';

  // Replace with an actual timestamp folder that exists in your R2 bucket
  const timestamp = '2026052006';

  return (
    <Map
      initialViewState={{
        longitude: 10,
        latitude: 52,
        zoom: 4
      }}
      style={{ width: '100%', height: '100vh' }}
      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
    >
      <Source
        type="raster"
        tiles={[`${R2_BASE}/${forecastType}/${timestamp}/{z}/{x}/{y}.png`]}
        tileSize={256}
        minzoom={4}
        maxzoom={6}
        scheme="tms"
      >
        <Layer
          type="raster"
          paint={{ 'raster-opacity': 0.75 }}
        />
      </Source>
    </Map>
  );
}

export default ForecastMap;
