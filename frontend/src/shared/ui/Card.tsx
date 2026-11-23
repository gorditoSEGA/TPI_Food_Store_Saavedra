import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  sinPadding?: boolean;
}

export default function Card({ sinPadding = false, className = "", children, ...resto }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-stone-200 bg-white shadow-panel ${sinPadding ? "" : "p-5"} ${className}`}
      {...resto}
    >
      {children}
    </div>
  );
}
