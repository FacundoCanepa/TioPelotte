"use client";

export default function SkeletonConsultarPedido() {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl px-4 py-3 shadow-sm animate-pulse">
      <div className="w-20 h-20 bg-gray-200 rounded" />
      <div className="flex-1 space-y-2">
        <div className="w-3/4 h-4 bg-gray-200 rounded" />
        <div className="w-1/2 h-3 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
