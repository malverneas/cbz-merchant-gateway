import { z } from 'zod';

export const businessInfoSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be less than 100 characters'),
  tradingName: z
    .string()
    .trim()
    .max(100, 'Trading name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  businessType: z
    .string()
    .trim()
    .min(1, 'Business type is required')
    .max(50, 'Business type must be less than 50 characters'),
  registrationNumber: z
    .string()
    .trim()
    .min(1, 'Registration number is required')
    .max(50, 'Registration number must be less than 50 characters'),
  taxId: z
    .string()
    .trim()
    .max(50, 'Tax ID must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  businessAddress: z
    .string()
    .trim()
    .min(1, 'Business address is required')
    .max(200, 'Address must be less than 200 characters'),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(50, 'City must be less than 50 characters'),
  province: z
    .string()
    .trim()
    .max(50, 'Province must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  postalCode: z
    .string()
    .trim()
    .max(20, 'Postal code must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  country: z.string().default('Zimbabwe'),
  websiteUrl: z
    .string()
    .trim()
    .max(200, 'Website URL must be less than 200 characters')
    .optional()
    .or(z.literal('')),
  expectedMonthlyVolume: z
    .string()
    .trim()
    .max(50, 'Expected volume must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  businessDescription: z
    .string()
    .trim()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .or(z.literal('')),
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

export const applicationFormSchema = businessInfoSchema.merge(contactInfoSchema);

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;
export type ContactInfoFormData = z.infer<typeof contactInfoSchema>;
export type ApplicationFormData = z.infer<typeof applicationFormSchema>;

// Validate a specific step
export const validateStep = (
  step: 'business' | 'contact',
  data: Partial<ApplicationFormData>
): { valid: boolean; errors: Record<string, string> } => {
  const schema = step === 'business' ? businessInfoSchema : contactInfoSchema;
  
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
