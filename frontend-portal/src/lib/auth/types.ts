import { z } from "zod";

export const UserRoleSchema = z.enum(["employee", "admin"]);

export const AuthUserSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  email: z.email(),
  name: z.string().min(1),
  role: UserRoleSchema,
});

export type UserRole = z.infer<typeof UserRoleSchema>;
export type AuthUser = z.infer<typeof AuthUserSchema>;
