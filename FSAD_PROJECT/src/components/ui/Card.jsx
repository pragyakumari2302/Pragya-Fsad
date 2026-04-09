export default function Card({ title, children, className = "", bodyClassName = "" }) {
  return (
    <div className={`bg-white border border-gray-300 ${className}`}>
      {title && (
        <h3 className="px-4 py-3 text-sm font-semibold border-b border-gray-300 bg-gray-50">
          {title}
        </h3>
      )}
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
