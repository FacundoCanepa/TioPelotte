"use client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MapPin,
  ShoppingBag,
  Percent,
  ScrollText,
  Logs,
  LayoutDashboard,
} from "lucide-react";

import { useUserStore } from "@/store/user-store";

interface MenuListProps {
  isOpen: boolean;
  closeMenu: () => void;
}

const links = [
  { text: "Inicio", href: "/", icon: Home },
  { text: "Productos", href: "/productos", icon: ShoppingBag },
  { text: "Ubicación", href: "/ubicacion", icon: MapPin },
  { text: "Recetas", href: "/recetas", icon: Percent },
  { text: "Nuestra historia", href: "/historia", icon: ScrollText },
  { text: "Consultar pedido", href: "/consultarPedido", icon: Logs },
];

const menuVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
      transition: {
      duration: 0.25,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
        transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};
const MenuList = ({ isOpen, closeMenu }: MenuListProps) => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const adminLinks =
    user && (user.role === "Administrador" || user.role === "Empleado")
      ? [{ text: "Panel", href: "/admin", icon: LayoutDashboard }]
      : [];
  const handleClick = (href: string) => {
    router.push(href);
    closeMenu();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.nav
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={menuVariants}
          className="absolute top-full left-0 w-full bg-[#FFD28C]/90 backdrop-blur-md z-30 py-6 shadow-md rounded-b-3xl md:left-1/2 md:-translate-x-1/2 md:w-[50vw]"
        >
          <ul className="flex flex-col items-start font-garamond text-[4.5vw] sm:text-base md:text-lg text-stone-800 px-6 gap-4 lg:justify-center">

            {[...links, ...adminLinks].map(({ text, href, icon: Icon }) => (
              <li
                key={text}
                onClick={() => handleClick(href)}
                className="flex items-center w-full gap-4 py-2 border-b border-black/30 last:border-none cursor-pointer hover:underline hover:text-yellow-900 transition-all"
              >
                <Icon size={20} className="text-yellow-800 shrink-0" />
                <span className="select-none">{text}</span>
              </li>

            ))}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
};

export default MenuList;
