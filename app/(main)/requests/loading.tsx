export default function RequestsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex justify-between items-center">
        <div>
          <div className="h-7 bg-gray-200 rounded w-40 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-56" />
        </div>
        <div className="h-9 bg-gray-200 rounded-lg w-32" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="h-9 bg-gray-100 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-48" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-4 border-b border-gray-100 last:border-0 flex items-center gap-4">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
