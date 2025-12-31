// Simple select field with a label.
function Select({ label, name, value, onChange, options = [], placeholder = "Select", ...rest }) {
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      ) : null}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white/90 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f3b37a] focus:border-[#e1473b]"
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;
