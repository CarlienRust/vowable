/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

/**
 * Get days until date (negative if past)
 */
export function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is within next N days
 */
export function isWithinDays(date: Date, days: number): boolean {
  const daysDiff = daysUntil(date);
  return daysDiff >= 0 && daysDiff <= days;
}

/**
 * Check if date is overdue
 */
export function isOverdue(date: Date): boolean {
  return daysUntil(date) < 0;
}
