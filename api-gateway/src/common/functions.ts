import { Permission, RolesData } from "./types";

export function extractUniquePermissions(rolesData: RolesData): Permission[] {
    const allPermissions = rolesData.getRolesByKeys.flatMap(role => role.permissions);
  
    const uniquePermissionsMap = new Map<string, Permission>();
  
    allPermissions.forEach(permission => {
      if (!uniquePermissionsMap.has(permission.key)) {
        uniquePermissionsMap.set(permission.key, permission);
      }
    });
  
    return Array.from(uniquePermissionsMap.values());
  }
  

  