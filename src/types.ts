export type UserRole = 'free' | 'premium' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  createdAt: string;
  subscriptionStatus?: 'active' | 'canceled' | 'none';
  subscriptionPlan?: 'monthly' | 'yearly' | 'none';
  expiresAt?: string | null;
  totalFilesProcessed?: number;
}

export type ToolType = 
  | 'merge' 
  | 'split' 
  | 'compress' 
  | 'pdf-to-img' 
  | 'img-to-pdf' 
  | 'pdf-to-word' 
  | 'word-to-pdf' 
  | 'img-convert'
  | 'pdf-to-ppt'
  | 'ppt-to-pdf'
  | 'pdf-to-excel'
  | 'excel-to-pdf';

export interface ToolDefinition {
  id: ToolType;
  name: string;
  description: string;
  category: 'pdf-edit' | 'pdf-convert' | 'img-edit';
  popular?: boolean;
  color: string;
}

export interface UsageLog {
  id: string;
  uid: string | null;
  email: string | null;
  tool: ToolType;
  timestamp: string;
  fileName: string;
  fileSize: number;
  status: 'success' | 'failed';
}

export interface BillingHistory {
  id: string;
  uid: string;
  email: string;
  amount: number;
  currency: string;
  plan: 'monthly' | 'yearly';
  timestamp: string;
  status: 'succeeded' | 'failed';
}

export interface SystemStats {
  totalUsers: number;
  premiumUsers: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
}
