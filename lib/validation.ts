import { z } from "zod"

// Form submission validation
export const contactFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  city: z.string().min(2, "City is required"),
  propertyType: z.string().min(2, "Property type is required"),
  budget: z.string().min(2, "Budget is required"),
  message: z.string().optional(),
})

// Partner registration validation
export const partnerRegistrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  company: z.string().min(2, "Company name is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  panCard: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN card format"),
  aadharCard: z.string().regex(/^\d{12}$/, "Invalid Aadhar card format"),
})

// Lead creation validation
export const leadSchema = z.object({
  clientName: z.string().min(2, "Client name is required"),
  clientEmail: z.string().email("Invalid email address"),
  clientPhone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number"),
  city: z.string().min(2, "City is required"),
  propertyType: z.string().min(2, "Property type is required"),
  budget: z.string().min(2, "Budget is required"),
  status: z.enum(["New", "Contacted", "Qualified", "Proposal", "Negotiation", "Closed", "Lost"]),
  assignedRM: z.string().optional(),
  notes: z.string().optional(),
})

// Login validation
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map((err) => `${err.path.join(".")}: ${err.message}`),
      }
    }
    return { success: false, errors: ["Validation failed"] }
  }
}
