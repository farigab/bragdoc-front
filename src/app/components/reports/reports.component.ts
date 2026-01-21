import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AIGitHubAnalysis, AISummaryReport, GitHubStats, PeriodReport } from '../../models/report.model';
import { ReportService } from '../../services/report.service';
import { DatePickerModule } from 'primeng/datepicker';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
    selector: 'app-reports',
  imports: [DatePipe, FormsModule, CardModule, ButtonModule, DatePickerModule, ChartModule, DialogModule, ProgressSpinnerModule, MarkdownPipe],
    templateUrl: './reports.component.html',
    styleUrls: ['./reports.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);

  private _startDate = signal(new Date(new Date().getFullYear(), 0, 1));
  private _endDate = signal(new Date());

  get startDate(): Date {
    return this._startDate();
  }

  set startDate(value: Date) {
    this._startDate.set(value);
  }

  get endDate(): Date {
    return this._endDate();
  }

  set endDate(value: Date) {
    this._endDate.set(value);
  }

  periodReport = signal<PeriodReport | null>(null);
  githubStats = signal<GitHubStats | null>(null);
  loading = signal(false);

  aiSummary = signal<AISummaryReport | null>(null);
  aiGithubAnalysis = signal<AIGitHubAnalysis | null>(null);
  loadingAI = signal(false);
  loadingGithubAI = signal(false);
  showAIModal = signal(false);
  showGitHubAIModal = signal(false);

  monthChartData = signal<any>(null);
  monthChartOptions = signal<any>(null);
  categoryChartData = signal<any>(null);
  categoryChartOptions = signal<any>(null);
  githubChartData = signal<any>(null);
  githubChartOptions = signal<any>(null);

  ngOnInit() {
    this.loadGitHubStats();
    this.generatePeriodReport();
  }

  generatePeriodReport() {
    this.loading.set(true);
    const startDateStr = this.formatDate(this._startDate());
    const endDateStr = this.formatDate(this._endDate());

    this.reportService.getByPeriod(startDateStr, endDateStr).subscribe({
      next: (data) => {
        this.periodReport.set(data);
        this.setupMonthChart(data);
        this.setupCategoryChart(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading period report:', error);
        this.loading.set(false);
      }
    });
  }

  loadGitHubStats() {
    this.reportService.getGitHubStats().subscribe({
      next: (data) => {
        this.githubStats.set(data);
        this.setupGitHubChart(data);
      },
      error: (error) => {
        console.error('Error loading GitHub stats:', error);
      }
    });
  }

  setupMonthChart(report: PeriodReport) {
    if (!report?.by_month) return;

    const labels = Object.keys(report.by_month);
    const data = Object.values(report.by_month);

    this.monthChartData.set({
      labels: labels,
      datasets: [
        {
          label: 'Achievements por Mês',
          data: data,
          backgroundColor: '#42A5F5',
          borderColor: '#1E88E5',
          borderWidth: 1
        }
      ]
    });

    this.monthChartOptions.set({
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    });
  }

  setupCategoryChart(report: PeriodReport) {
    if (!report?.by_category) return;

    const labels = Object.keys(report.by_category);
    const data = Object.values(report.by_category);

    this.categoryChartData.set({
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: [
            '#42A5F5',
            '#66BB6A',
            '#FFA726',
            '#AB47BC',
            '#EC407A',
            '#26A69A'
          ]
        }
      ]
    });

    this.categoryChartOptions.set({
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    });
  }

  setupGitHubChart(stats: GitHubStats) {
    if (!stats) return;

    this.githubChartData.set({
      labels: ['Pull Requests', 'Issues', 'Commits', 'Repositories'],
      datasets: [
        {
          label: 'GitHub Stats',
          data: [
            stats.pull_requests,
            stats.issues,
            stats.commits,
            stats.repositories
          ],
          backgroundColor: [
            '#28A745',
            '#007BFF',
            '#FFC107',
            '#DC3545'
          ]
        }
      ]
    });

    this.githubChartOptions.set({
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  exportData() {
    this.reportService.exportAll().subscribe({
      next: (data) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bragdoc-export-${new Date().getTime()}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error exporting data:', error);
      }
    });
  }

  generateAISummary() {
    this.loadingAI.set(true);
    const startDateStr = this.formatDate(this._startDate());
    const endDateStr = this.formatDate(this._endDate());

    this.reportService.getAISummary('executive', undefined, startDateStr, endDateStr).subscribe({
      next: (data) => {
        this.aiSummary.set(data);
        this.loadingAI.set(false);
        this.showAIModal.set(true);
      },
      error: (error) => {
        console.error('Error loading AI summary:', error);
        this.loadingAI.set(false);
      }
    });
  }

  generateGitHubAIAnalysis() {
    this.loadingGithubAI.set(true);
    this.reportService.getAIGitHubAnalysis().subscribe({
      next: (data) => {
        this.aiGithubAnalysis.set(data);
        this.loadingGithubAI.set(false);
        this.showGitHubAIModal.set(true);
      },
      error: (error) => {
        console.error('Error loading GitHub AI analysis:', error);
        this.loadingGithubAI.set(false);
      }
    });
  }
}
