"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CartFloatButton() {
  const { cart } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();

  const itemCount = cart.length;

if (["/cart", "/checkout"].includes(pathname) || itemCount === 0) return null;


  return (
    <motion.button
      onClick={() => router.push("/cart")}
      className="fixed bottom-24 right-5 z-50 p-4 rounded-full bg-white/50 text-[#8B4513] shadow-xl hover:bg-[#f5c741] transition-colors duration-300 flex items-center justify-center cursor-pointer group"
      aria-label="Ir al carrito"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
    >
      <div className="relative">
        <ShoppingCart className="w-7 h-7 group-hover:scale-110 transition-transform" />
        <span className="absolute -top-2 -right-2 bg-[#D16A45] text-white text-xs font-bold px-2 py-0.5 rounded-full cursor-pointer shadow-sm">
          {itemCount}
        </span>
      </div>
    </motion.button>
  );
}
