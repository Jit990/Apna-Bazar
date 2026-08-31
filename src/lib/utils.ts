import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format price in Indian Rupees
export function formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

// Calculate discount percentage
export function calculateDiscount(mrp: number, price: number): number {
    if (mrp <= 0 || price <= 0 || price >= mrp) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
}

// Truncate text
export function truncate(str: string, length: number): string {
    if (str.length <= length) return str;
    return str.substring(0, length) + '…';
}

// Generate slug from name
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Format date in Indian format
export function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string): string {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(dateStr));
}

// Validate Indian mobile number
export function isValidIndianMobile(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Indian numbers: 10 digits starting with 6-9
    return /^[6-9]\d{9}$/.test(cleaned);
}

// Validate Indian PIN code
export function isValidPincode(pin: string): boolean {
    return /^[1-9][0-9]{5}$/.test(pin);
}

// Generate order number
export function generateOrderNumber(id: number): string {
    return `APB${String(id).padStart(4, '0')}`;
}

// Get stock status label
export function getStockLabel(status: string): { label: string; color: string } {
    switch (status) {
        case 'in_stock':
            return { label: 'In Stock', color: 'text-green-600' };
        case 'low_stock':
            return { label: 'Only few left', color: 'text-orange-500' };
        case 'out_of_stock':
            return { label: 'Out of Stock', color: 'text-red-500' };
        default:
            return { label: 'Unknown', color: 'text-gray-500' };
    }
}

// Order status display
export function getOrderStatusInfo(status: string): {
    label: string;
    color: string;
    bgColor: string;
} {
    const map: Record<string, { label: string; color: string; bgColor: string }> = {
        pending: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
        confirmed: { label: 'Confirmed', color: 'text-blue-700', bgColor: 'bg-blue-100' },
        preparing: { label: 'Preparing', color: 'text-purple-700', bgColor: 'bg-purple-100' },
        ready_for_delivery: { label: 'Ready for Delivery', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
        out_for_delivery: { label: 'Out for Delivery', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
        delivered: { label: 'Delivered', color: 'text-green-700', bgColor: 'bg-green-100' },
        cancelled: { label: 'Cancelled', color: 'text-red-700', bgColor: 'bg-red-100' },
        payment_failed: { label: 'Payment Failed', color: 'text-red-700', bgColor: 'bg-red-100' },
        refunded: { label: 'Refunded', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    };
    return map[status] ?? { label: status, color: 'text-gray-700', bgColor: 'bg-gray-100' };
}

// Deep clone
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

// Debounce
export function debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// Safe JSON parse
export function safeJsonParse<T>(str: string, fallback: T): T {
    try {
        return JSON.parse(str) as T;
    } catch {
        return fallback;
    }
}

// Pluralize
export function pluralize(count: number, word: string, plural?: string): string {
    return count === 1 ? `${count} ${word}` : `${count} ${plural ?? word + 's'}`;
}
