import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary";

interface ButtonProps {
  variant: ButtonVariant;
  children: ReactNode;
  startIcon?: ReactNode;
  onClick?: () => void;
}

const variantStyles = {
  primary: "bg-purple-600 text-white hover:bg-purple-700",
  secondary:
    "bg-white text-purple-600 border border-purple-300 hover:bg-purple-50",
};

export function Button({ variant, children, startIcon, onClick }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${variantStyles[variant]}`}
    >
      {startIcon && <span>{startIcon}</span>}
      {children}
    </button>
  );
}
