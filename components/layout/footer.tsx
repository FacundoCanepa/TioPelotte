"use client";
import { useRouter } from 'next/navigation';


const Footer = () => {
  const router = useRouter();
  return (
    <footer className="mt-4 font-garamond bg-[#ffcc80] text-stone-700">
      <div className="w-full max-w-screen-xl mx-auto px-2 py-3">
        <div className="flex flex-wrap justify-between md:items-start gap-y-2 text-center md:text-left">

          {/* Columna 1: Marca */}
          <div className="w-full sm:w-1/3 flex flex-col items-center md:items-start ">
            <p className="border-b-2 border-black/20  border-dotted  md:border-0 ">
              <span className="font-bold text-3xl">Tio pelotte</span>
              <span className="text-xs block">Pastas frescas</span>
            </p>
          </div>

          {/* Columna 2: Horarios */}
          <div className="w-full sm:w-1/3 text-base space-y-1 flex flex-col items-center md:items-start">
          <div className="border-b-2 border-black/20  border-dotted  md:border-0 ">
            <p><span className="font-semibold">Martes a Sábados:</span> 9:00 a 12:30 / 17:00 a 21:00 hs</p>
            <p><span className="font-semibold">Domingos:</span> 8:00 a 13:00 hs</p>
            <p><span className="font-semibold">Lunes:</span> Cerrado (menos los días 29)</p>
          </div>
          </div>

          {/* Columna 3: Enlaces */}
          <div className="w-full sm:w-1/3 flex justify-center md:justify-end">
          <ul className="flex flex-col gap-1 items-center md:items-end">
            <li className="cursor-pointer select-none md:hover:underline underline md:no-underline" onClick={() => router.push("/historia")}>Sobre nosotros</li>
            <li className="cursor-pointer select-none md:hover:underline underline md:no-underline" onClick={() => router.push("/ubicacion")}>Contacto</li>
            <li className="cursor-pointer select-none md:hover:underline underline md:no-underline" onClick={() => router.push("/productos")}>Productos</li>
          </ul>
          </div>


        </div>

        {/* Pie de copyright */}
        <div className="text-center text-xs text-stone-600 mt-4  ">
          © Tio pelotte, 2025. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
