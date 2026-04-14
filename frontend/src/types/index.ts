// Strict source of truth — matches the .NET backend exactly

// ── Auth ─────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  fullName: string
  googleRefreshToken?: string
}

export interface AuthResponse {
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  fullName: string
  email: string
  password: string
}

// ── Enums (backend serializes these as integers) ─────────────

export const ApplicationStage = {
  Applied: 0,
  Screening: 1,
  Interview: 2,
  Offer: 3,
  Rejected: 4,
  Withdrawn: 5,
} as const;

export type ApplicationStage =
  typeof ApplicationStage[keyof typeof ApplicationStage];

export const SuggestionStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const;

export type SuggestionStatus =
  typeof SuggestionStatus[keyof typeof SuggestionStatus];

// ── Core Entities ─────────────────────────────────────────────

export interface JobApplication {
  id: number
  userId: number
  companyName: string
  jobTitle?: string
  jobUrl?: string
  location?: string
  employmentType: number
  currentStage: ApplicationStage
  notes?: string
  isArchived: boolean
  appliedAt: string
  lastUpdatedAt: string
}

export interface CreateApplicationRequest {
  companyName: string
  jobTitle: string
  jobUrl?: string
  location?: string
  currentStage: ApplicationStage
  notes?: string
}

// ── History ───────────────────────────────────────────────────

export interface HistoryEvent {
  id: number
  jobApplicationId: number
  stage: ApplicationStage
  comment: string
  changedAt: string
}

// ── Dashboard Stats ───────────────────────────────────────────

export interface DashboardStats {
  totalApplications: number
  activeApplications: number
  interviewsScheduled: number
  rejectedApplications: number
}

// ── AI Suggestions ────────────────────────────────────────────

export interface AISuggestion {
  id: number
  messageId: string
  emailSubject: string
  companyName: string
  jobTitle?: string
  suggestedStage?: ApplicationStage
  suggestedInterviewDate?: string
  status: SuggestionStatus
  createdAt: string
}

// ── General API Error ─────────────────────────────────────────

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}