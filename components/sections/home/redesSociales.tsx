import { Facebook, Instagram, MessageCircle } from "lucide-react";

const RedesSociales = () => {
  return (
    <section className="py-16 px-4">
      <div className="max-w-xl mx-auto text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-garamond italic tracking-wide">
          Sumate a la comunidad
        </h2>

        <p className="text-sm md:text-base text-stone-700 font-garamond">
          Seguinos en nuestras redes sociales y conocé nuestras últimas novedades,
          recetas y promociones.
        </p>

        <div className="flex justify-center gap-6 md:gap-8" role="navigation" aria-label="Redes sociales">
          <a
            href="https://wa.me/5492211234567"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="p-3 rounded-full border border-green-600 text-green-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:bg-green-600 hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
          </a>

          <a
            href="https://www.instagram.com/tiopelotte/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="p-3 rounded-full border border-pink-500 text-pink-500 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:bg-pink-500 hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
          >
            <Instagram className="w-6 h-6 md:w-8 md:h-8" />
          </a>

          <a
            href="https://www.facebook.com/p/Pastas-Tio-Pelotte-100063991449642/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="p-3 rounded-full border border-blue-600 text-blue-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:bg-blue-600 hover:text-white hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Facebook className="w-6 h-6 md:w-8 md:h-8" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default RedesSociales;
