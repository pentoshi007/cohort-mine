import type { ReactNode } from "react";

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarItem({ icon, label, active, onClick }: SidebarItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 cursor-pointer rounded-lg transition-colors ${
        active
          ? "bg-purple-100 text-purple-600"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="text-gray-600">{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
  );
}

interface LogoProps {
  icon: ReactNode;
  title: string;
}

export function Logo({ icon, title }: LogoProps) {
  return (
    <div className="flex items-center gap-2 mb-10">
      <div className="text-purple-600">{icon}</div>
      <span className="text-xl font-semibold text-gray-900">{title}</span>
    </div>
  );
}
