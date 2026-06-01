import { useState, useEffect } from 'react';
import ForecastMap from './components/ForecastMap';
import TimeControls from './components/TimeControls';
import ForecastSelector from './components/ForecastSelector';
import './App.css';

const R2_BASE = 'https://data.fallcast.com';

function App() {
  const [metadata, setMetadata]           = useState(null);
  const [forecastType, setForecastType]   = useState(null);
  const [timestampIndex, setTimestampIndex] = useState(0);

  useEffect(() => {
    fetch(`${R2_BASE}/metadata.json`)
      .then(r => r.json())
      .then(data => {
        setMetadata(data);
        if (data.forecast_types?.length > 0) {
          setForecastType(data.forecast_types[0].id);
        }
      })
      .catch(err => console.error('Failed to load metadata:', err));
  }, []);

  if (!metadata || !forecastType) {
    return <div className='loading'>Loading forecast data...</div>;
  }

  const timestamps = metadata.time_steps;

  return (
    <div className='app-container'>

      {/* The map fills the whole container */}
      <ForecastMap
        forecastType={forecastType}
        timestamps={timestamps}
        currentIndex={timestampIndex}
      />

      {/* Controls float over the bottom-centre of the map */}
      <div className='controls-overlay'>
        <ForecastSelector
          types={metadata.forecast_types}
          selected={forecastType}
          onChange={setForecastType}
        />
        <TimeControls
          timeSteps={timestamps}
          currentIndex={timestampIndex}
          onChange={setTimestampIndex}
        />
      </div>

    </div>
  );
}

export default App;
