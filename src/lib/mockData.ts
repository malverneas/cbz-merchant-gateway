import { User, Merchant, Application, Document, Comment, UserRole, ApplicationStatus } from './types';

// Mock Users with Shona names
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'merchant@example.com',
    name: 'Tatenda Moyo',
    role: 'merchant',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    email: 'onboarding@cbz.co.zw',
    name: 'Rumbidzai Chikwanha',
    role: 'onboarding_officer',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    email: 'compliance@cbz.co.zw',
    name: 'Tinashe Mapfumo',
    role: 'compliance_officer',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    email: 'admin@cbz.co.zw',
    name: 'Farai Mutasa',
    role: 'admin',
    createdAt: new Date('2024-01-01'),
  },
];

// Mock Merchants with Shona names
export const mockMerchants: Merchant[] = [
  {
    id: 'm1',
    userId: '1',
    businessName: 'Harare Electronics Ltd',
    businessType: 'Retail',
    registrationNumber: 'REG-2024-001',
    taxId: 'TIN-123456',
    address: '123 Samora Machel Ave',
    city: 'Harare',
    country: 'Zimbabwe',
    phone: '+263 4 123 456',
    website: 'www.harareelectronics.co.zw',
    contactPerson: 'Tatenda Moyo',
    contactEmail: 'merchant@example.com',
    contactPhone: '+263 77 123 4567',
  },
  {
    id: 'm2',
    userId: '5',
    businessName: 'Bulawayo Traders',
    businessType: 'Wholesale',
    registrationNumber: 'REG-2024-002',
    taxId: 'TIN-234567',
    address: '45 Main Street',
    city: 'Bulawayo',
    country: 'Zimbabwe',
    phone: '+263 9 234 567',
    contactPerson: 'Chiedza Nyamande',
    contactEmail: 'chiedza@bulawayotraders.co.zw',
    contactPhone: '+263 77 234 5678',
  },
];

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: 'd1',
    applicationId: 'app1',
    type: 'business_registration',
    fileName: 'business_registration.pdf',
    fileUrl: '/documents/business_registration.pdf',
    uploadedAt: new Date('2024-01-20'),
  },
  {
    id: 'd2',
    applicationId: 'app1',
    type: 'director_id',
    fileName: 'director_id.jpg',
    fileUrl: '/documents/director_id.jpg',
    uploadedAt: new Date('2024-01-20'),
  },
  {
    id: 'd3',
    applicationId: 'app1',
    type: 'proof_of_address',
    fileName: 'utility_bill.pdf',
    fileUrl: '/documents/utility_bill.pdf',
    uploadedAt: new Date('2024-01-20'),
  },
];

// Mock Comments with Shona names
export const mockComments: Comment[] = [
  {
    id: 'c1',
    applicationId: 'app1',
    userId: '2',
    userName: 'Rumbidzai Chikwanha',
    userRole: 'onboarding_officer',
    content: 'All documents verified. Forwarding to compliance team.',
    createdAt: new Date('2024-01-21'),
  },
  {
    id: 'c2',
    applicationId: 'app2',
    userId: '2',
    userName: 'Rumbidzai Chikwanha',
    userRole: 'onboarding_officer',
    content: 'Initial review completed. Business registration looks good.',
    createdAt: new Date('2024-01-22'),
  },
];

// Mock Applications
export const mockApplications: Application[] = [
  {
    id: 'app1',
    merchantId: 'm1',
    merchant: mockMerchants[0],
    status: 'compliance_review',
    documents: mockDocuments.filter(d => d.applicationId === 'app1'),
    comments: mockComments.filter(c => c.applicationId === 'app1'),
    submittedAt: new Date('2024-01-20'),
    reviewedAt: new Date('2024-01-21'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-21'),
  },
  {
    id: 'app2',
    merchantId: 'm2',
    merchant: mockMerchants[1],
    status: 'under_review',
    documents: [],
    comments: mockComments.filter(c => c.applicationId === 'app2'),
    submittedAt: new Date('2024-01-22'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: 'app3',
    merchantId: 'm1',
    merchant: mockMerchants[0],
    status: 'approved',
    documents: mockDocuments,
    comments: [],
    submittedAt: new Date('2024-01-10'),
    reviewedAt: new Date('2024-01-12'),
    approvedAt: new Date('2024-01-14'),
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-14'),
  },
];

// Helper to get current user (simulated auth)
let currentUser: User | null = null;

export const setCurrentUser = (user: User | null) => {
  currentUser = user;
};

export const getCurrentUser = (): User | null => {
  return currentUser;
};

export const loginUser = (email: string, password: string): User | null => {
  const user = mockUsers.find(u => u.email === email);
  if (user) {
    setCurrentUser(user);
    return user;
  }
  return null;
};

export const logoutUser = () => {
  setCurrentUser(null);
};

export const getApplicationsByMerchant = (merchantId: string): Application[] => {
  return mockApplications.filter(app => app.merchantId === merchantId);
};

export const getApplicationsByStatus = (statuses: ApplicationStatus[]): Application[] => {
  return mockApplications.filter(app => statuses.includes(app.status));
};

export const getAllApplications = (): Application[] => {
  return mockApplications;
};
