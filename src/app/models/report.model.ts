export interface AICustomSummaryRequest {
  startDate: string;
  endDate: string;
  userPrompt: string;
  repositories: string[];
  reportType: ReportType;
}

export interface AISummaryReport {
  aiGeneratedReport: string;
  generatedAt: string;
  reportType: ReportType;
}

export type ReportType = 'EXECUTIVE' | 'TECHNICAL' | 'TIMELINE' | 'GITHUB';

export interface ReportTypeInfo {
  type: ReportType;
  label: string;
  description: string;
  icon: string;
}
