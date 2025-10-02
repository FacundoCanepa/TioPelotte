import AdminGuard from "@/components/guards/AdminGuard";
import { Sidebar } from "@/components/layout/sidebar";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <AdminGuard>
        <div className="min-h-screen text-[#5A3E1B] flex flex-col lg:flex-row">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
            {children}
          </main>
        </div>
      </AdminGuard>
    </ReactQueryProvider>
  );
}
