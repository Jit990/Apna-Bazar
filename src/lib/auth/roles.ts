export const STAFF_ROLES = ['admin', 'manager', 'staff'] as const;

export type StaffRole = (typeof STAFF_ROLES)[number];

export function isStaffRole(role: string | null | undefined): role is StaffRole {
    return !!role && (STAFF_ROLES as readonly string[]).includes(role);
}
