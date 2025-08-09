import { Skeleton } from "./skeleton";

type SkeletonSchemaProps = {
  count: number;
};

const SkeletonSchema = ({ count }: SkeletonSchemaProps) => {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="w-full sm:w-[48%] md:w-[45%] lg:w-[30%] xl:w-[22%] bg-white/30 backdrop-blur-2xl rounded-xl shadow-md flex flex-col h-full p-4 gap-4"
        >
          {/* Imagen */}
          <div className="relative w-full h-[17rem] overflow-hidden rounded-xl">
            <Skeleton className="absolute inset-0 w-full h-full rounded-xl" />
          </div>

          {/* Título */}
          <Skeleton className="h-5 w-3/4 rounded" />

          {/* Descripción */}
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />

          {/* Botón */}
          <div className="mt-auto">
            <Skeleton className="h-10 w-[70%] rounded-full mx-auto" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonSchema;
