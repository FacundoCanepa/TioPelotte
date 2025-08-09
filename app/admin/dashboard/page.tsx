import AdminDashboard from "@/components/sections/admin/AdminDashboard";
import AdministradorGuard from "@/components/guards/AdministradorGuard";

export default function DashboardPage() {
  return (
    <AdministradorGuard>
      <AdminDashboard />
    </AdministradorGuard>
  );
}