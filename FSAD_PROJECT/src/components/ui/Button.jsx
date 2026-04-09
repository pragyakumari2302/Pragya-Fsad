export default function Button({
  children,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400",
    secondary: "bg-gray-300 text-gray-800 hover:bg-gray-400",
    outline: "border border-gray-400 text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  return (
    <button
      className={`px-4 py-2 font-medium cursor-pointer ${variants[variant]} ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
