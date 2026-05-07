'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type IconButtonProps = {
  icon: ReactNode;
  variant?: 'default' | 'danger' | 'ghost';
} & ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANT_CLASSES = {
  default: 'text-gray-500 hover:text-gray-700 cursor-pointer',
  danger: 'text-red-500 hover:text-red-700 cursor-pointer',
  ghost: 'text-gray-400 hover:text-gray-600 cursor-pointer',
};

export default function IconButton({
  icon,
  variant = 'default',
  disabled,
  type = 'button',
  className = '',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex cursor-pointer items-center justify-center rounded-md p-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}
