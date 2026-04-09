export default function Input({
  label,
  id,
  error,
  className = "",
  ...props
}) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 border bg-white text-gray-900 ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
