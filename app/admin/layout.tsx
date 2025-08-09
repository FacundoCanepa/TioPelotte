import AdminGuard from "@/components/guards/AdminGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen text-[#5A3E1B] p-6">
        {children}
      </div>
    </AdminGuard>
  );
}
