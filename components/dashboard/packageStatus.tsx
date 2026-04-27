import type { Package } from '@/types/package';

export type PackageStatus = 'checked_in' | 'checked_out' | 'dropped_off';

export function getPackageStatus(pkg: Package): PackageStatus {
  if (pkg.deliveredToOffice) return 'dropped_off';
  if (pkg.datePickedUp != null) return 'checked_out';
  return 'checked_in';
}

const STATUS_STYLES: Record<PackageStatus, { label: string; className: string }> = {
  checked_in:  { label: 'Checked In',  className: 'bg-byu-green-bright text-white' },
  checked_out: { label: 'Checked Out', className: 'bg-byu-info-blue-bright text-white' },
  dropped_off: { label: 'Dropped Off', className: 'bg-byu-yellow-bright text-byu-dark-gray' },
};

export function PackageStatusBadge({ pkg }: { pkg: Package }) {
  const { label, className } = STATUS_STYLES[getPackageStatus(pkg)];
  return (
    <span className={`inline-block rounded px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
