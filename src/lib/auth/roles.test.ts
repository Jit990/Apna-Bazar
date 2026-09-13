import { describe, expect, it } from 'vitest';
import { isStaffRole } from '@/lib/auth/roles';

describe('admin role gate', () => {
    it('allows staff roles and rejects customers', () => {
        expect(isStaffRole('admin')).toBe(true);
        expect(isStaffRole('manager')).toBe(true);
        expect(isStaffRole('staff')).toBe(true);
        expect(isStaffRole('customer')).toBe(false);
        expect(isStaffRole(null)).toBe(false);
        expect(isStaffRole('')).toBe(false);
    });
});
