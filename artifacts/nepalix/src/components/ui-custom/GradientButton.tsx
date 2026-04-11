import { ReactNode } from "react";
import { Link } from "wouter";

interface GradientButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function GradientButton({
  children,
  href,
  onClick,
  className = "",
  variant = "primary",
  size = "md",
}: GradientButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-md relative group overflow-hidden";
  
  const sizeStyles = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const primaryStyles = "bg-gradient-primary text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]";
  const ghostStyles = "bg-transparent text-white border border-[rgba(148,163,184,0.3)] hover:bg-[rgba(255,255,255,0.05)]";

  const styles = `${baseStyles} ${sizeStyles[size]} ${variant === "primary" ? primaryStyles : ghostStyles} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
        {variant === "primary" && (
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={styles}>
      {children}
      {variant === "primary" && (
        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </button>
  );
}
