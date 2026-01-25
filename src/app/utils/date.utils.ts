export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

export type Preset =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'last2Weeks'
  | 'thisMonth'
  | 'lastMonth'
  | 'last3Months'
  | 'last6Months'
  | 'thisYear'
  | 'lastYear';

class DateRangeCache {
  private cache = new Map<string, DateRange>();

  get(preset: Preset, referenceDate: Date): DateRange | null {
    const key = this.createKey(preset, referenceDate);
    return this.cache.get(key) ?? null;
  }

  set(preset: Preset, referenceDate: Date, range: DateRange): void {
    const key = this.createKey(preset, referenceDate);
    this.cache.set(key, range);

    // Limita tamanho do cache (LRU simples)
    if (this.cache.size > 50) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
  }

  private createKey(preset: Preset, date: Date): string {
    return `${preset}-${date.toISOString().split('T')[0]}`;
  }

  clear(): void {
    this.cache.clear();
  }
}

const rangeCache = new DateRangeCache();

export function getToday(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}


export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const diff = d.getDay() === 0 ? 6 : d.getDay() - 1;
  d.setDate(d.getDate() - diff);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function getStartOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function getEndOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function getStartOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

export function getEndOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31);
}


export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

export function getDateRange(preset: Preset, referenceDate: Date = getToday()): DateRange {
  // Verifica cache primeiro
  const cached = rangeCache.get(preset, referenceDate);
  if (cached) return cached;

  const range = calculateDateRange(preset, referenceDate);
  rangeCache.set(preset, referenceDate, range);

  return range;
}

function calculateDateRange(preset: Preset, ref: Date): DateRange {
  const today = new Date(ref);

  switch (preset) {
    case 'today':
      return { start: today, end: today };

    case 'yesterday': {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      return { start: d, end: d };
    }

    case 'thisWeek':
      return { start: getStartOfWeek(today), end: today };

    case 'lastWeek': {
      const endOfLastWeek = new Date(getStartOfWeek(today));
      endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
      const startOfLastWeek = getStartOfWeek(endOfLastWeek);
      return { start: startOfLastWeek, end: endOfLastWeek };
    }

    case 'last2Weeks': {
      const start = new Date(today);
      start.setDate(start.getDate() - 13);
      return { start, end: today };
    }

    case 'thisMonth':
      return { start: getStartOfMonth(today), end: today };

    case 'lastMonth': {
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      const start = getStartOfMonth(end);
      return { start, end };
    }

    case 'last3Months': {
      const start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      return { start, end: today };
    }

    case 'last6Months': {
      const start = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      return { start, end: today };
    }

    case 'thisYear':
      return { start: getStartOfYear(today), end: today };

    case 'lastYear': {
      const year = today.getFullYear() - 1;
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31)
      };
    }

    default:
      throw new Error(`Unknown preset: ${preset satisfies never}`);
  }
}

export function clearDateRangeCache(): void {
  rangeCache.clear();
}

export function isDateInRange(date: Date, range: DateRange): boolean {
  const time = date.getTime();
  return time >= range.start.getTime() && time <= range.end.getTime();
}

export function getDaysInRange(range: DateRange): number {
  const ms = range.end.getTime() - range.start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
}
