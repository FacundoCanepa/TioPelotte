import Link from "next/link";
import { Home, ShoppingCart, Package, Users, Utensils, DollarSign, Truck } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-4">
      <nav className="flex flex-col space-y-4">
        <Link href="/admin/dashboard" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <Home size={20} />
          <span>Dashboard</span>
        </Link>
        <Link href="/admin/pedidos" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <ShoppingCart size={20} />
          <span>Pedidos</span>
        </Link>
        <Link href="/admin/productos" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <Package size={20} />
          <span>Productos</span>
        </Link>
        <Link href="/admin/recetas" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <Utensils size={20} />
          <span>Recetas</span>
        </Link>
        <Link href="/admin/usuarios" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <Users size={20} />
          <span>Usuarios</span>
        </Link>
        <Link href="/admin/proveedores" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <Truck size={20} />
          <span>Proveedores</span>
        </Link>
        <Link href="/admin/ordenes-de-compra" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <ShoppingCart size={20} />
          <span>Órdenes de Compra</span>
        </Link>
        <Link href="/admin/gastos" className="flex items-center space-x-2 text-gray-700 hover:text-gray-900">
          <DollarSign size={20} />
          <span>Gastos</span>
        </Link>
      </nav>
    </aside>
  );
}
