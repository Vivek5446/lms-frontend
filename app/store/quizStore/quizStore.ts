import { makeAutoObservable } from "mobx";
import axios from "axios";

export interface QuizAttemptRecord {
  _id: string;
  quiz: {
    _id: string;
    title: string;
    description?: string;
    theme?: { primaryColor?: string };
    settings?: { passingPercentage?: number };
    company?: {
      _id: string;
      company_name: string;
      logo?: { url?: string };
    };
  };
  score: number;
  maxScore: number;
  percentage: number;
  isPassed: boolean;
  timeTakenSeconds?: number;
  startTime: string;
  status: string;
  attemptNumber: number;
}

class QuizStore {
  myAttempts: QuizAttemptRecord[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  fetchMyAttempts = async () => {
    this.loading = true;
    this.error = null;
    try {
      const response = await axios.get("/quiz/my-attempts");
      this.myAttempts = response.data?.data || [];
      return this.myAttempts;
    } catch (err: any) {
      this.error =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to fetch quiz attempts";
      return [];
    } finally {
      this.loading = false;
    }
  };
}

export const quizStore = new QuizStore();
