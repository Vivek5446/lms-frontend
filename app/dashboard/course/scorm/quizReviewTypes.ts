"use client";

export type ScormReviewStatus = "pending" | "reviewed";

export interface ScormReviewActor {
  _id?: string;
  name?: string;
  email?: string;
  username?: string;
}

export interface ScormInteractionReview {
  _id: string;
  index: number;
  id: string;
  type?: string;
  question?: string;
  learnerResponse?: string;
  correctResponses?: string[];
  result?: string;
  latency?: string;
  time?: string;
  maxMarks?: number | null;
  source?: "cmi.interactions" | "suspend_data";
  review: {
    status: ScormReviewStatus;
    feedback?: string;
    marksOverride?: number | null;
    reviewedBy?: ScormReviewActor | null;
    reviewedAt?: string | null;
  };
}

export interface ScormAnswerSectionRecord {
  _id: string;
  userId: string;
  courseId: string;
  moduleId: string;
  sectionId: string;
  courseTitle?: string;
  moduleTitle?: string;
  sectionTitle?: string;
  lessonStatus: string;
  score: number | null;
  lessonLocation?: string;
  suspendData?: string;
  totalTime?: string;
  attempts: number;
  lastAccessed?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  reviewSummary: {
    pending: number;
    reviewed: number;
  };
  interactions: ScormInteractionReview[];
}

export type ScormReviewDraftMap = Record<string, { marksOverride: string; feedback: string }>;

export function summarizeAnswerSections(sections: ScormAnswerSectionRecord[]) {
  return sections.reduce(
    (summary, section) => ({
      totalQuestions: summary.totalQuestions + Number(section.totalQuestions || 0),
      correctCount: summary.correctCount + Number(section.correctCount || 0),
      incorrectCount: summary.incorrectCount + Number(section.incorrectCount || 0),
      pending: summary.pending + Number(section.reviewSummary?.pending || 0),
      reviewed: summary.reviewed + Number(section.reviewSummary?.reviewed || 0),
    }),
    {
      totalQuestions: 0,
      correctCount: 0,
      incorrectCount: 0,
      pending: 0,
      reviewed: 0,
    }
  );
}
