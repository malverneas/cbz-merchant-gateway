import { z } from 'zod';

export const businessInfoSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be less than 100 characters'),
  natureOfBusiness: z
    .string()
    .trim()
    .min(1, 'Nature of business is required')
    .max(100, 'Nature of business must be less than 100 characters'),
  accountNumber: z
    .string()
    .trim()
    .min(1, 'Account number is required')
    .max(50, 'Account number must be less than 50 characters'),
  idNumber: z
    .string()
    .trim()
    .min(1, 'ID number is required')
    .max(50, 'ID number must be less than 50 characters'),
  businessAddress: z
    .string()
    .trim()
    .min(1, 'Business address is required')
    .max(200, 'Address must be less than 200 characters'),
  websiteUrl: z
    .string()
    .trim()
    .max(200, 'Website URL must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(50, 'City must be less than 50 characters'),
  province: z
    .string()
    .trim()
    .min(1, 'Province is required')
    .max(50, 'Province must be less than 50 characters'),
  country: z.string().default('Zimbabwe'),
});

export const serviceTypeSchema = z.object({
  serviceTypes: z
    .array(z.string())
    .min(1, 'Please select at least one service type'),
});

export const contactInfoSchema = z.object({
  contactName: z
    .string()
    .trim()
    .min(1, 'Contact name is required')
    .max(100, 'Contact name must be less than 100 characters'),
  contactEmail: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  contactPhone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .max(30, 'Phone number must be less than 30 characters'),
});

export const applicationFormSchema = businessInfoSchema.merge(serviceTypeSchema).merge(contactInfoSchema);

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;
export type ServiceTypeFormData = z.infer<typeof serviceTypeSchema>;
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;
export type ApplicationFormData = z.infer<typeof applicationFormSchema>;

// Validate a specific step
export const validateStep = (
  step: 'business' | 'service' | 'contact',
  data: Partial<ApplicationFormData>
): { valid: boolean; errors: Record<string, string> } => {
  const schema = step === 'business'
    ? businessInfoSchema
    : step === 'service'
      ? serviceTypeSchema
      : contactInfoSchema;

  const result = schema.safeParse(data);

  if (result.success) {
    return { valid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    if (err.path[0]) {
      errors[err.path[0] as string] = err.message;
    }
  });

  return { valid: false, errors };
};
