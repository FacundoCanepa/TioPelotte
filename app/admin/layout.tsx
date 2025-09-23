import AdminGuard from "@/components/guards/AdminGuard";
import { Sidebar } from "@/components/layout/sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen text-[#5A3E1B] p-6 flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
