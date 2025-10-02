import Link from "next/link";
import { Home, ShoppingCart, Package, Users, Utensils, DollarSign, Truck, Wheat, Tags, Factory } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-4 hidden lg:block">
      <nav className="flex flex-col space-y-2">
        <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md min-h-[44px]">
          <Home size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/admin/pedidos" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md min-h-[44px]">
          <ShoppingCart size={20} />
          <span>Pedidos</span>
        </Link>
        <Link href="/admin/productos" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md min-h-[44px]">
          <Package size={20} />
          <span>Productos</span>
        </Link>
        <Link href="/admin/ingredientes" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md min-h-[44px]">
          <Wheat size={20} />
          <span>ingredientes</span>
        </Link>
        <Link href="/admin/categoria_ingrediente" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md min-h-[44px]">
          <Tags size={20} />
          <span>Categorías</span>
        </Link>
        <Link href="/admin/recetas" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md min-h-[44px]">
          <Utensils size={20} />
          <span>Recetas</span>
        </Link>
        <Link href="/admin/fabricacion" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md min-h-[44px]">
          <Factory size={20} />
          <span>Fabricación</span>
        </Link>
        <Link href="/admin/usuarios" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md min-h-[44px]">
          <Users size={20} />
          <span>Usuarios</span>
        </Link>
        <Link href="/admin/proveedores" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md min-h-[44px]">
          <Truck size={20} />
          <span>Proveedores</span>
        </Link>
        <Link href="/admin/ordenes-de-compra" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md min-h-[44px]">
          <ShoppingCart size={20} />
          <span>Órdenes de Compra</span>
        </Link>
        <Link href="/admin/gastos" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md min-h-[44px]">
          <DollarSign size={20} />
          <span>Gastos</span>
        </Link>
      </nav>
    </aside>
  );
}
