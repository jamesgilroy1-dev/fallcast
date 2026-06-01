import { useState, useEffect, useRef } from 'react';

function formatTimestamp(ts) {
  if (!ts) return '';
  if (ts.includes('T') || (ts.includes('-') && ts.length > 10)) {
    const d = new Date(ts);
    return d.toUTCString().replace(':00 GMT', ' UTC');
  }
  const year  = ts.slice(0, 4);
  const month = parseInt(ts.slice(4, 6)) - 1;
  const day   = ts.slice(6, 8);
  const hour  = ts.slice(8, 10);
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun',
                       'Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(day)} ${monthNames[month]} ${year}  ${hour}:00 UTC`;
}

const SPEEDS = [
  { label: '0.5×', ms: 1200 },
  { label: '1×',   ms: 600  },
  { label: '2×',   ms: 300  },
  { label: '4×',   ms: 150  },
];

function TimeControls({ timeSteps, currentIndex, onChange }) {
  const [playing, setPlaying] = useState(false);
  const [displayIndex, setDisplayIndex] = useState(currentIndex);
  const [speedIndex, setSpeedIndex] = useState(1); // default 1×
  const intervalRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    setDisplayIndex(currentIndex);
  }, [currentIndex]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        onChange(prev => (prev + 1) % timeSteps.length);
      }, SPEEDS[speedIndex].ms);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, speedIndex, timeSteps.length, onChange]);

  const handleSliderChange = (e) => {
    const newIndex = parseInt(e.target.value);
    setPlaying(false);
    setDisplayIndex(newIndex);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onChange(newIndex), 100);
  };

  return (
    <div className='time-controls'>
      <div className='time-label'>
        {formatTimestamp(timeSteps[displayIndex])}
      </div>

      <div className='time-buttons'>
        <button onClick={() => {
          setPlaying(false);
          onChange(Math.max(0, currentIndex - 1));
        }}>
          &#9664;
        </button>

        <button onClick={() => setPlaying(p => !p)}>
          {playing ? '⏸ Pause' : '▶ Play'}
        </button>

        <button onClick={() => {
          setPlaying(false);
          onChange(Math.min(timeSteps.length - 1, currentIndex + 1));
        }}>
          &#9654;
        </button>

        <select
          className='speed-select'
          value={speedIndex}
          onChange={e => setSpeedIndex(parseInt(e.target.value))}
        >
          {SPEEDS.map((s, i) => (
            <option key={i} value={i}>{s.label}</option>
          ))}
        </select>
      </div>

      <input
        type='range'
        className='time-slider'
        min={0}
        max={timeSteps.length - 1}
        value={displayIndex}
        onChange={handleSliderChange}
      />
    </div>
  );
}

export default TimeControls;
