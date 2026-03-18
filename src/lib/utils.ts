import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price with comma decimal: 10,90
export function formatPrice(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0,00';
  const num = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : Number(value);
  if (isNaN(num)) return '0,00';
  return num.toFixed(2).replace('.', ',');
}

// Parse price input that may use comma or dot
export function parsePrice(value: string): number {
  return parseFloat(value.replace(',', '.'));
}

// Generate a URL-safe slug from a string
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// Get full image URL
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_APP_URL || ''}${path}`;
}
