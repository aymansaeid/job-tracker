// ── Auth ─────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  FullName: string
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

// ── Enums (integers — DO NOT use strings) ────────────────────

export const ApplicationStage = {
  Applied:   0,
  InReview:  1,
  Interview: 2,
  Offer:     3,
  Rejected:  4,
  Ghosted:   5,
} as const
export type ApplicationStage = typeof ApplicationStage[keyof typeof ApplicationStage]

export const EmploymentType = {
  FullTime:  0,
  PartTime:  1,
  Contract:  2,
  Internship:3,
} as const
export type EmploymentType = typeof EmploymentType[keyof typeof EmploymentType]

export const SuggestionStatus = {
  Pending:  0,
  Approved: 1,
  Rejected: 2,
} as const
export type SuggestionStatus = typeof SuggestionStatus[keyof typeof SuggestionStatus]

// ── Core Entities ─────────────────────────────────────────────

export interface JobApplication {
  id: number
  userId: number
  companyName: string
  jobTitle?: string
  jobUrl?: string
  location?: string
  employmentType: EmploymentType
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
  employmentType: EmploymentType
  appliedAt: string
  notes?: string
}

export interface UpdateApplicationRequest {
  companyName: string
  jobTitle: string
  jobUrl?: string
  location?: string
  employmentType: EmploymentType
  appliedAt: string
  notes?: string
}

export interface ChangeStageRequest {
  stage: ApplicationStage
  comment?: string
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
  appliedCount: number
  inReviewCount: number
  interviewCount: number
  offerCount: number
  rejectedCount: number
  ghostedCount: number
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
  aiReasoning : string
  actionUrl : string
}

// ── User Profile ──────────────────────────────────────────────

export interface UpdateProfileRequest {
  fullName: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// ── Paginated Response ────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// ── API Error ─────────────────────────────────────────────────

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}