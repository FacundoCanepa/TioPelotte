"use client";

import { useUserStore } from "@/store/user-store";
import { useCartStore } from "@/store/cart-store";
import { motion } from "framer-motion";
import { Sparkles, Mail, ShoppingCart } from "lucide-react";

export default function PerfilHeader() {
  const user = useUserStore((state) => state.user);
  const cart = useCartStore((state) => state.cart);
  const cartCount = cart.length;;

  if (!user) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full text-center py-4 px-3 bg-white/70 rounded-xl shadow-sm border border-[#FFD966]/40"
    >
      <div className="flex items-center justify-center gap-2 mb-1 text-[#8B4513]">
        <Sparkles className="w-5 h-5" />
        <h2 className="text-2xl font-bold">¡Bienvenido de nuevo, {user.username}!</h2>
      </div>

      <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
        <Mail className="w-4 h-4 text-gray-500" />
        {user.email}
      </p>

      {cartCount > 0 ? (
        <p className="mt-2 text-[#D16A45] text-sm flex items-center justify-center gap-2 font-medium">
          <ShoppingCart className="w-4 h-4" />
          Tenés {cartCount} {cartCount === 1 ? "producto" : "productos"} en el carrito.
        </p>
      ) : (
        <p className="mt-2 text-sm text-gray-500 italic">
          🛍 Tu carrito está vacío... ¡pero nunca es tarde para llenarlo!
        </p>
      )}

      <p className="mt-3 text-[#6B8E23] text-sm font-medium">
        🍝 Nos encanta tenerte en Tío Pelotte. ¡Esperamos que tengas un antojo pronto!
      </p>
    </motion.section>
  );
}
