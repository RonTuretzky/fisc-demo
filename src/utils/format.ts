import type { BillStatus } from '../types';

/**
 * Format a number as a currency string with appropriate suffix.
 * - Billions: "$1.50B"
 * - Millions: "$12.34M"
 * - Thousands: "$5.00K"
 * - Below 1000: "$750"
 */
export function formatCurrency(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 1_000_000_000) {
    return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(2)}K`;
  }
  return `${sign}$${abs.toLocaleString()}`;
}

/**
 * Format an ISO date string as a human-readable date, e.g. "Feb 24, 2026".
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Return a human-readable label for a given BillStatus.
 */
export function statusLabel(status: BillStatus): string {
  const labels: Record<BillStatus, string> = {
    draft: 'Draft',
    house_floor: 'House Floor',
    house_voting: 'House Voting',
    house_passed: 'House Passed',
    house_failed: 'House Failed',
    senate_floor: 'Senate Floor',
    senate_voting: 'Senate Voting',
    senate_passed: 'Senate Passed',
    senate_failed: 'Senate Failed',
    presidential_review: 'Presidential Review',
    signed: 'Signed by President',
    vetoed: 'Vetoed',
    veto_override_house: 'Veto Override - House',
    veto_override_senate: 'Veto Override - Senate',
    enacted: 'Enacted into Law',
    failed: 'Failed',
  };
  return labels[status] ?? status;
}

/**
 * Return a Tailwind text color class appropriate for the given BillStatus.
 */
export function statusColor(status: BillStatus): string {
  switch (status) {
    case 'draft':
      return 'text-gray-500';
    case 'house_floor':
    case 'senate_floor':
      return 'text-amber-600';
    case 'house_voting':
    case 'senate_voting':
      return 'text-blue-500';
    case 'house_passed':
    case 'senate_passed':
      return 'text-emerald-600';
    case 'house_failed':
    case 'senate_failed':
    case 'failed':
      return 'text-red-600';
    case 'presidential_review':
      return 'text-purple-600';
    case 'signed':
      return 'text-green-600';
    case 'vetoed':
      return 'text-red-700';
    case 'veto_override_house':
    case 'veto_override_senate':
      return 'text-orange-600';
    case 'enacted':
      return 'text-green-700';
    default:
      return 'text-gray-500';
  }
}
