"use client";
import { useUserStore } from "@/store/user-store";
import { BarChart2, Boxes, UtensilsCrossed, Wheat, Users, BookOpen } from "lucide-react";
import AdminCard from "./AdminCard";

export default function AdminHome() {
  const user = useUserStore((s) => s.user);
  const isAdmin = user?.role === "Administrador";

  return (
    <div className="space-y-10">
      <h1 className="text-3xl font-semibold text-[#8B4513] font-garamond">Administración</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {isAdmin && (
          <AdminCard href="/admin/dashboard" title="Dashboard Económico" icon={<BarChart2 className="h-8 w-8" />} />
        )}
        <AdminCard href="/admin/pedidos" title="Pedidos" icon={<Boxes className="h-8 w-8" />} />
        <AdminCard href="/admin/productos" title="Productos" icon={<UtensilsCrossed className="h-8 w-8" />} />
        <AdminCard href="/admin/ingredientes" title="Ingredientes" icon={<Wheat className="h-8 w-8" />} />
        <AdminCard href="/admin/recetas" title="Recetas" icon={<BookOpen className="h-8 w-8" />} />
        {isAdmin && (
          <AdminCard href="/admin/usuarios" title="Usuarios" icon={<Users className="h-8 w-8" />} />
        )}
      </div>
    </div>
  );
}

