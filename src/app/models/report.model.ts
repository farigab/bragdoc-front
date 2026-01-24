import { Achievement } from './achievement.model';

export interface TimelineReport {
  readonly total: number;
  readonly timeline: Record<string, Achievement[]>;
}

export interface AISummaryReport {
  readonly reportType: string;
  readonly totalAchievements: number;
  readonly aiGeneratedReport: string;
  readonly filtersApplied: {
    readonly category: string;
    readonly startDate: string | null;
    readonly endDate: string | null;
  };
}

export interface AIGitHubAnalysis {
  readonly totalGithubAchievements: number;
  readonly aiAnalysis: string;
  readonly statistics: Record<string, number>;
}

export interface AICustomSummaryRequest {
  startDate: string;
  endDate: string;
  userPrompt?: string;
  repositories?: string[];
  reportType?: string;
  category?: string;
}
