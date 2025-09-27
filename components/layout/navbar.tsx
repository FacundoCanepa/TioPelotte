
"use client";

import { useRouter } from "next/navigation";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useToggleMenu } from "../hooks/useMenuToggle";
import MenuList from "./menuList";
import { useCartStore } from "@/store/cart-store";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const { isOpen, toggleMenu, closeMenu } = useToggleMenu();
  const cart = useCartStore((state) => state.cart);
  const itemCount = cart.length;

  return (
    <>
      <header className="fixed top-0 left-0 w-full h-16 md:h-20 bg-[#F9F6F2]/80 backdrop-blur-md z-50 transition-all duration-300 ease-in-out shadow-sm">
        <div className="container mx-auto flex justify-between items-center h-full px-4 md:px-6">
          
          {/* Botón de Menú (Hamburguesa) */}
          <div className="flex items-center">
            <button onClick={toggleMenu} className="text-gray-700 hover:text-gray-900 transition-colors focus:outline-none">
              {isOpen ? (
                <X className="w-7 h-7 md:w-8 md:h-8" />
              ) : (
                <Menu className="w-7 h-7 md:w-8 md:h-8" />
              )}
            </button>
          </div>

          {/* Logo Principal */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
            <div className="relative w-12 h-12 md:w-16 md:h-16 cursor-pointer" onClick={() => router.push("/")}>
              <Image src="/favicon.ico" alt="Tio Pelotte Icon" fill className="object-contain" />
            </div>
            <span
              className="hidden sm:block ml-2 text-xl md:text-2xl font-semibold text-gray-800 tracking-wider cursor-pointer"
              onClick={() => router.push("/")}
            >
              Tio Pelotte
            </span>
          </div>

          {/* Iconos de la Derecha */}
          <div className="flex items-center gap-4 md:gap-6">
            <div
              className="relative cursor-pointer group"
              onClick={() => router.push("/cart")}
            >
              <ShoppingCart className="w-7 h-7 md:w-8 md:h-8 text-gray-700 group-hover:text-gray-900 transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full">
                  {itemCount}
                </span>
              )}
            </div>
          </div>

        </div>
      </header>
      
      <MenuList isOpen={isOpen} closeMenu={closeMenu} />
      
      {/* Espaciador para el contenido de la página */}
      <div className="h-16 md:h-20"></div>
    </>
  );
}
