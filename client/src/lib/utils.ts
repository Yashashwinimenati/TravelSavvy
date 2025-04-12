import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines classnames from different sources, useful for conditional styling
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency numbers
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

// Format date for display
export function formatDate(date: Date | string): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Format time for display
export function formatTime(time: string): string {
  if (!time) return '';
  
  // If the time is already in 12h format with AM/PM, return as is
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  
  try {
    // Assume time is in 24h format (HH:MM)
    const [hour, minute] = time.split(':').map(Number);
    
    if (isNaN(hour) || isNaN(minute)) return time;
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
  } catch (e) {
    return time;
  }
}

// Truncate text to specific length
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generate random ID (useful for temporary keys)
export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Debounce function to prevent excessive API calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Get distance between two dates in days
export function getDaysBetweenDates(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Check if web speech API is available
export function isSpeechRecognitionSupported(): boolean {
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}
