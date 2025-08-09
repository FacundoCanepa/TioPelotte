"use client";
import Link from "next/link";
import { ReactNode } from "react";

interface Props {
  href: string;
  title: string;
  icon: ReactNode;
}

export default function AdminCard({ href, title, icon }: Props) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-xl shadow hover:bg-[#FFF4E3] transition-colors text-[#5A3E1B]"
    >
      <span className="text-[#8B4513]">{icon}</span>
      <span className="font-semibold text-center text-sm">{title}</span>
    </Link>
  );
}