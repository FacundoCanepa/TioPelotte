
import SectionHeader from "@/components/ui/SectionHeader";
import { SuppliersSection } from "@/components/sections/admin/suppliers/SuppliersSection";

export default function ProveedoresPage() {
  return (
    <div>
      <SectionHeader
        title="Proveedores"
        subtitle="Gestiona tus proveedores y sus precios."
      />
      <SuppliersSection />
    </div>
  );
}
