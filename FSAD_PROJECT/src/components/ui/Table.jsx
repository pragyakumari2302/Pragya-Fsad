export default function Table({ columns, data, isLoading, emptyMessage = "No data" }) {
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-300 p-8 text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="bg-white border border-gray-300 p-8 text-center text-gray-600">
        {emptyMessage}
      </div>
    );
  }

  const getColumnLabel = (col) => {
    if (typeof col === "object" && col?.label) return col.label;
    return String(col).charAt(0).toUpperCase() + String(col).slice(1);
  };

  const getColumnKey = (col) => (typeof col === "object" ? col.key : col);

  return (
    <div className="overflow-x-auto bg-white border border-gray-300">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300">
            {columns.map((col) => (
              <th
                key={getColumnKey(col)}
                className="px-4 py-2 font-semibold text-gray-700"
              >
                {getColumnLabel(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={row.id ?? i} className="border-b border-gray-200 hover:bg-gray-50">
              {columns.map((col) => {
                const key = getColumnKey(col);
                const value = row[key];
                return (
                  <td key={key} className="px-4 py-2 text-gray-700">
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
