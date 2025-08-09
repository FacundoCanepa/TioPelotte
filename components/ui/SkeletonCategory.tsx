import { Skeleton } from "./skeleton";

const SkeletonCategory = () => {
  return (
    <div className="w-full h-[400px] flex justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl h-full rounded-xl overflow-hidden bg-white/30 backdrop-blur-sm shadow-md relative">
        {/* Fondo tipo imagen */}
        <Skeleton className="absolute inset-0 w-full h-full object-cover" />

        {/* Gradiente simulado */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />

        {/* Título simulado */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="px-6 py-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Skeleton className="h-6 w-48 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCategory;
