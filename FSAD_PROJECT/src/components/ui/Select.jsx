export default function Select({
  label,
  id,
  error,
  options = [],
  placeholder = "Select…",
  className = "",
  ...props
}) {
  const selectId = id || label?.toLowerCase().replace(/\s/g, "-");

  return (
    <div className={className}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 border bg-white text-gray-900 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) =>
          typeof opt === "object" ? (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ) : (
            <option key={opt} value={opt}>
              {opt}
            </option>
          )
        )}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
