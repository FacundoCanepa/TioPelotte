"use client";
import { ReactNode } from "react";

interface Props {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export default function ResumenCard({ title, value, icon }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
      <div className="text-[#8B4513]">{icon}</div>
      <div>
        <p className="text-sm text-stone-600">{title}</p>
        <p className="text-xl font-semibold text-[#5A3E1B]">{value}</p>
      </div>
    </div>
  );
}