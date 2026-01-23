import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AIGitHubAnalysis, AISummaryReport } from '../../models/report.model';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { LoggingService } from '../../services/logging.service';
import { NotificationService } from '../../services/notification.service';
import { ReportService } from '../../services/report.service';

@Component({
  selector: 'app-reports',
  imports: [FormsModule, CardModule, ButtonModule, DatePickerModule, ChartModule, DialogModule, ProgressSpinnerModule, MarkdownPipe],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit {
  private reportService = inject(ReportService);
  private logger = inject(LoggingService);
  private notify = inject(NotificationService);

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
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  generateAISummary() {
    this.loadingAI.set(true);
    const startDateStr = this.formatDate(this._startDate());
    const endDateStr = this.formatDate(this._endDate());

    this.reportService.getAISummary('TECHNICAL', undefined, startDateStr, endDateStr).subscribe({
      next: (data) => {
        this.aiSummary.set(data);
        this.loadingAI.set(false);
        this.showAIModal.set(true);
      },
      error: (error) => {
        this.logger.error('Error loading AI summary', { error });
        this.notify.error('Erro ao gerar resumo IA', String((error as any)?.message ?? error));
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
        this.logger.error('Error loading GitHub AI analysis', { error });
        this.notify.error('Erro ao gerar análise IA GitHub', String((error as any)?.message ?? error));
        this.loadingGithubAI.set(false);
      }
    });
  }
}
