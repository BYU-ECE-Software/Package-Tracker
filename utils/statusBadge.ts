// Picks a badge "tone" based on common status keywords
export function statusToBadgeClasses(status: string): string {
  const s = (status ?? '').toLowerCase();

  if (
    s.includes('retir') ||
    s.includes('cancel') ||
    s.includes('inactive') ||
    s.includes('return') ||
    s.includes('beau') || // this is for harry potter template example can take this out in dev
    s.includes('durm') // this is for harry potter template example can take this out in dev
  ) {
    return 'bg-gray-100 text-gray-700 ring-1 ring-gray-200';
  }

  if (
    s.includes('maint') ||
    s.includes('repair') ||
    s.includes('broken') ||
    s.includes('raven') // this is for harry potter template example can take this out in dev
  ) {
    return 'bg-blue-50 text-blue-800 ring-1 ring-blue-200';
  }

  if (
    s.includes('loan') ||
    s.includes('checked') ||
    s.includes('borrow') ||
    s.includes('pend') ||
    s.includes('progr') ||
    s.includes('huffle') // this is for harry potter template example can take this out in dev
  ) {
    return 'bg-amber-50 text-amber-800 ring-1 ring-amber-200';
  }

  if (
    s.includes('avail') ||
    s.includes('ready') ||
    s.includes('active') ||
    s.includes('ongoing') ||
    s.includes('complete') ||
    s.includes('slyth') // this is for harry potter template example can take this out in dev
  ) {
    return 'bg-green-50 text-green-800 ring-1 ring-green-200';
  }

  if (
    s.includes('late') ||
    s.includes('over') ||
    s.includes('past') ||
    s.includes('reject') ||
    s.includes('gryf') // this is for harry potter template example can take this out in dev
  ) {
    return 'bg-red-50 text-red-800 ring-1 ring-red-200';
  }

  return 'bg-slate-50 text-slate-700 ring-1 ring-slate-200';
}
