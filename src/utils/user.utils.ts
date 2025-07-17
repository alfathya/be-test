import { UserRole } from "@prisma/client";

export function transformRoleToEnumRole(role: string): UserRole {
  switch (role) {
    case "ADMIN":
      return UserRole.ADMIN;
    default:
      return UserRole.USER;
  }
}
