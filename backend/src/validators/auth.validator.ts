import { z } from "zod";

export const emailField = z.email("Enter a valid email").transform((v) => v.toLowerCase().trim());
export const passwordField = z
  .string()
  .min(8, "At least 8 characters")
  .max(128)
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/[0-9]/, "Add a number");
export const phoneField = z.string().trim().max(30).regex(/^[+\d][\d\s()-]{6,}$/, "Enter a valid phone number");
const code = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code");

export const loginSchema = z.object({ email: emailField, password: z.string().min(1, "Password is required").max(128) });
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  email: emailField,
  phone: phoneField.optional().or(z.literal("")),
  password: passwordField,
});
export const emailSchema = z.object({ email: emailField });
export const verifyOtpSchema = z.object({ email: emailField, code });
export const resetPasswordSchema = z.object({ email: emailField, code, password: passwordField });
export const changePasswordSchema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: passwordField });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
