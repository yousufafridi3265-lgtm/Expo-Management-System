// Chhote filter buttons. options: [{ value, label }], value: abhi chuni hui value, onChange(value)
const FilterChips = ({ options, value, onChange, label }) => {
  return (
    <div className="filter-chips" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`chip ${value === option.value ? "chip-active" : ""}`}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default FilterChips;