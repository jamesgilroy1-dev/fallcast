// types  = array of { id, name } objects from metadata.json
// selected = the id of the currently active forecast type
// onChange = function to call when the user picks a different type
function ForecastSelector({ types, selected, onChange }) {
  return (
    <div className='forecast-selector'>
      <label>Forecast:</label>
      <select
        value={selected}
        onChange={e => onChange(e.target.value)}
      >
        {types.map(t => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ForecastSelector;
