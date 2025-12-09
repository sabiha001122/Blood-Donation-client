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
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-500"
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
