"use client";

export const PERMISSION_KEYS = {
  VIEW_DASHBOARD: "view_dashboard",
  VIEW_USERS: "view_users",
  CREATE_USERS: "create_users",
  CREATE_MANAGERS: "create_managers",
  CREATE_DEPARTMENT_HEADS: "create_department_heads",
  EDIT_USERS: "edit_users",
  ASSIGN_MANAGERS: "assign_managers",
  VIEW_DEPARTMENTS: "view_departments",
  VIEW_COMPANIES: "view_companies",
  VIEW_COURSES: "view_courses",
  MANAGE_COURSES: "manage_courses",
  ASSIGN_COURSES: "assign_courses",
  VIEW_BATCHES: "view_batches",
  MANAGE_BATCHES: "manage_batches",
  MANAGE_PERMISSIONS: "manage_permissions",
  VIEW_PROFILE: "view_profile",
} as const;

export const ALL_PERMISSION_KEYS = Object.values(PERMISSION_KEYS);

export function getPermissionRecord(user: any) {
  const role = String(user?.role || user?.userType || "").toLowerCase();
  if (role === "superadmin") {
    return ALL_PERMISSION_KEYS.reduce<Record<string, boolean>>((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
  }

  return user?.effectivePermissions || {};
}

export function hasPermission(user: any, permissionKey: string) {
  const permissions = getPermissionRecord(user);
  return Boolean(permissions?.[permissionKey]);
}
