import { useAppSelector } from './redux';

export function usePermissions() {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.role?.permissions || [];

  const hasPermission = (permission: string | string[]): boolean => {
    if (Array.isArray(permission)) {
      return permission.some((p) => permissions.includes(p));
    }
    return permissions.includes(permission);
  };

  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every((p) => permissions.includes(p));
  };

  return {
    permissions,
    hasPermission,
    hasAllPermissions,
  };
}
