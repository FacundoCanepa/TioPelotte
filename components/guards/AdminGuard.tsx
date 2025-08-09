"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/user-store";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useUserStore((state) => state.user);
  const jwt = useUserStore((state) => state.jwt);
  const isSessionChecked = useUserStore((state) => state.isSessionChecked);

  useEffect(() => {
    if (!isSessionChecked) return;
    if (!user || !jwt) {
      router.replace("/login");
    } else if (user.role !== "Administrador" && user.role !== "Empleado") {
      router.replace("/");
    }
  }, [isSessionChecked, user, jwt, router]);

  const hasAccess =
    user && jwt && (user.role === "Administrador" || user.role === "Empleado");

  if (!isSessionChecked || !hasAccess) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#8B4513]" />
      </div>
    );
  }

  return <>{children}</>;
}