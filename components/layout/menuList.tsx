
"use client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Home, MapPin, ShoppingBag, Percent, ScrollText, UserRound, Ticket, LayoutDashboard } from "lucide-react";
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
];

const menuVariants: Variants = {
  hidden: { opacity: 0, x: "-100%" },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    x: "-100%",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

const MenuList = ({ isOpen, closeMenu }: MenuListProps) => {
  const router = useRouter();
  const user = useUserStore((state) => state.user);

  const handleClick = (href: string) => {
    router.push(href);
    closeMenu();
  };

  const adminLinks = user && (user.role === "Administrador" || user.role === "Empleado")
    ? [{ text: "Panel de Control", href: "/admin", icon: LayoutDashboard }]
    : [];

  const userLinks = user
    ? [{ text: "Mi Perfil", href: "/perfil", icon: UserRound }, { text: "Mis Pedidos", href: "/consultarPedido", icon: Ticket }]
    : [{ text: "Iniciar Sesión", href: "/login", icon: UserRound }];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={menuVariants}
          className="fixed top-0 left-0 w-full h-full bg-[#F9F6F2]/80 backdrop-blur-md z-40 overscroll-y-none"
          onClick={closeMenu}
        >
          <motion.nav
            className="w-3/4 max-w-sm h-full bg-[#F9F6F2] shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Evita que el menú se cierre al hacer clic dentro
          >
            <div className="p-6 border-b border-black/10">
              <h2 className="text-2xl font-bold text-gray-800">Menú</h2>
            </div>
            <ul className="p-6 space-y-4">
              {[...links, ...adminLinks].map(({ text, href, icon: Icon }) => (
                <li key={text}>
                  <a
                    onClick={() => handleClick(href)}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    <Icon size={22} className="text-gray-600" />
                    <span className="text-lg font-medium text-gray-700">{text}</span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="absolute bottom-0 left-0 w-full p-6 border-t border-black/10">
              <ul className="space-y-4">
                {userLinks.map(({ text, href, icon: Icon }) => (
                  <li key={text}>
                    <a
                      onClick={() => handleClick(href)}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
                    >
                      <Icon size={22} className="text-gray-600" />
                      <span className="text-lg font-medium text-gray-700">{text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MenuList;
