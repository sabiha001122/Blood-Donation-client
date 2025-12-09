// Labeled input used across forms.
function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  error,
  ...rest
}) {
  return (
    <div className="w-full">
      {label ? (
        <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      ) : null}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-500 bg-white shadow-sm ${
          error ? "border-red-400" : "border-slate-200"
        }`}
        {...rest}
      />
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

export default Input;
