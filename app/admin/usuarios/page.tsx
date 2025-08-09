import UsuariosSection from "@/components/sections/admin/UsuariosSection";
import AdministradorGuard from "@/components/guards/AdministradorGuard";

export default function UsuariosPage() {
  return (
    <AdministradorGuard>
      <UsuariosSection />
    </AdministradorGuard>
  );
}