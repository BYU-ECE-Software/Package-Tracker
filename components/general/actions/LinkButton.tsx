import type { ReactNode, ComponentProps } from 'react';
import Link from 'next/link';
import type { ButtonVariant, ButtonSize } from './Button';

type LinkButtonProps = {
  label?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  variant?: Exclude<ButtonVariant, 'danger'>;
  size?: ButtonSize;
  fullWidth?: boolean;
  children?: ReactNode;
} & ComponentProps<typeof Link>;

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'bg-byu-royal text-white hover:bg-[#003C9E] border border-transparent',
  secondary: 'bg-transparent text-gray-700 border border-gray-300 hover:bg-gray-50',
  ghost: 'bg-transparent text-gray-600 border border-transparent hover:bg-gray-100',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs rounded-md gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-base rounded-lg gap-2.5',
};

export default function LinkButton({
  label,
  icon,
  iconPosition = 'left',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      className={`inline-flex items-center justify-center font-medium transition-colors ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className} `}
      {...rest}
    >
      {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {label ? <span>{label}</span> : children}
      {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </Link>
  );
}
