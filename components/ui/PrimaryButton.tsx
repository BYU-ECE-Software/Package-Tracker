"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = {
  label?: string;
  icon?: ReactNode;
  bgClass?: string;
  hoverBgClass?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export default function PrimaryButton({
  label,
  icon,
  bgClass = "bg-byu-royal text-white",
  hoverBgClass = "hover:bg-[#003C9E]",
  disabled,
  type = "button",
  children,
  className = "",
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-3 py-1 font-medium rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${bgClass} ${hoverBgClass} ${className}`}
      {...rest}
    >
      {icon && <span className="flex items-center">{icon}</span>}
      {label ? <span>{label}</span> : children}
    </button>
  );
}
