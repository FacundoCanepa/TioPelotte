interface Props {
  totalPages: number;
  currentPage: number;
  setPage: (page: number) => void;
}

const ProductosPagination = ({ totalPages, currentPage, setPage }: Props) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const baseBtn =
    "px-3 py-2 rounded-md border border-[#8B4513] bg-[#FFF4E3] text-[#8B4513] shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";

  const handlePrev = () => {
    if (currentPage > 1) setPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setPage(currentPage + 1);
  };

  return (
    <div className="flex flex-wrap items-center justify-center mt-10 gap-2">
      <button onClick={handlePrev} disabled={currentPage === 1} className={baseBtn}>
        Anterior
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => setPage(page)}
          className={`${baseBtn} ${
            currentPage === page ? "bg-[#FFD966] font-semibold ring-2 ring-[#8B4513]" : ""
          }`}
        >
          {page}
        </button>
      ))}

      <button onClick={handleNext} disabled={currentPage === totalPages} className={baseBtn}>
        Siguiente
      </button>
    </div>
  );
};

export default ProductosPagination;