export type UserRole = 'merchant' | 'onboarding_officer' | 'compliance_officer' | 'admin';

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'compliance_review'
  | 'approved'
  | 'rejected'
  | 'additional_documents_requested';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
}

export interface Merchant {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  registrationNumber: string;
  taxId: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  website?: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

export interface Document {
  id: string;
  applicationId: string;
  type: 'business_registration' | 'director_id' | 'proof_of_address' | 'other';
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  applicationId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  content: string;
  createdAt: Date;
}

export interface Application {
  id: string;
  merchantId: string;
  merchant?: Merchant;
  status: ApplicationStatus;
  documents: Document[];
  comments: Comment[];
  submittedAt?: Date;
  reviewedAt?: Date;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const statusLabels: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  compliance_review: 'Compliance Review',
  approved: 'Approved',
  rejected: 'Rejected',
  additional_documents_requested: 'Additional Documents Requested',
};

export const statusColors: Record<ApplicationStatus, string> = {
  draft: 'draft',
  submitted: 'submitted',
  under_review: 'review',
  compliance_review: 'compliance',
  approved: 'approved',
  rejected: 'rejected',
  additional_documents_requested: 'documents',
};
