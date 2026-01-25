import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { StepperModule } from 'primeng/stepper';
import { ToastModule } from 'primeng/toast';
import { ReportType } from '../../models/report.model';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { GithubImportFacade, Preset } from './github-import.facade';

interface PresetOption {
  readonly label: string;
  readonly value: Preset;
}

interface ReportTypeOption {
  readonly label: string;
  readonly value: ReportType;
  readonly description: string;
}

@Component({
  selector: 'app-github-import',
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ToastModule,
    StepperModule,
    DialogModule,
    ProgressSpinnerModule,
    MarkdownPipe
  ],
  providers: [MessageService, GithubImportFacade],
  templateUrl: './github-import.component.html',
  styleUrls: ['./github-import.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'github-import-page' }
})
export class GithubImportComponent implements OnInit {
  private readonly facade = inject(GithubImportFacade);
  private readonly messageService = inject(MessageService);

  // Expose facade properties to template
  readonly token = this.facade.token;
  readonly repositories = this.facade.repositories;
  readonly selectedRepos = this.facade.selectedRepos;
  readonly selectedPreset = this.facade.selectedPreset;
  readonly customPrompt = this.facade.customPrompt;
  readonly selectedReportType = this.facade.selectedReportType;
  readonly aiSummary = this.facade.aiSummary;
  readonly showAIModal = this.facade.showAIModal;
  readonly loading = this.facade.loading;
  readonly displayName = this.facade.displayName;
  readonly hasRepositories = this.facade.hasRepositories;
  readonly selectedCount = this.facade.selectedCount;
  readonly hasDateRange = this.facade.hasDateRange;
  readonly promptLength = this.facade.promptLength;
  readonly activeStep = this.facade.activeStep;

  readonly maxPromptLength = 1000;

  readonly presetOptions: readonly PresetOption[] = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'This Week', value: 'thisWeek' },
    { label: 'Last Week', value: 'lastWeek' },
    { label: 'Last 2 Weeks', value: 'last2Weeks' },
    { label: 'This Month', value: 'thisMonth' },
    { label: 'Last Month', value: 'lastMonth' },
    { label: 'Last 3 Months', value: 'last3Months' },
    { label: 'Last 6 Months', value: 'last6Months' },
    { label: 'This Year', value: 'thisYear' },
    { label: 'Last Year', value: 'lastYear' }
  ] as const;

  readonly reportTypeOptions: readonly ReportTypeOption[] = [
    {
      label: 'Executive Report',
      value: 'EXECUTIVE',
      description: 'Concise summary with quantified achievements and professional profile'
    },
    {
      label: 'Technical Report',
      value: 'TECHNICAL',
      description: 'In-depth technical analysis of contributions and tech stack'
    },
    {
      label: 'Timeline Report',
      value: 'TIMELINE',
      description: 'Career evolution narrative showing professional growth'
    },
    {
      label: 'GitHub Report',
      value: 'GITHUB',
      description: 'Open source contributions analysis with quality metrics'
    }
  ] as const;

  ngOnInit(): void {
    this.facade.checkForSavedToken();
  }

  // === Event Handlers ===

  saveToken(): void {
    this.facade.saveToken(
      () => this.showSuccess('Token saved successfully'),
      (msg) => this.showError(msg)
    );
  }

  clearToken(): void {
    this.facade.clearToken(
      () => this.showSuccess('Token cleared'),
      (msg) => this.showError(msg)
    );
  }

  analyzeAI(): void {
    this.facade.analyzeAI(
      this.maxPromptLength,
      () => this.showSuccess('AI analysis complete'),
      (msg) => this.showError(msg)
    );
  }

  selectAll(): void {
    this.facade.selectAll();
  }

  clearSelection(): void {
    this.facade.clearSelection();
  }

  toggleSelection(repo: string): void {
    this.facade.toggleSelection(repo);
  }

  selectPreset(preset: Preset): void {
    this.facade.selectPreset(preset);
  }

  goToStep(step: number): void {
    this.facade.goToStep(step);
  }

  advanceToStep(step: number): void {
    this.facade.goToStep(step, true);
  }

  canGoTo(step: number): boolean {
    return this.facade.canGoTo(step);
  }

  goBackToStep1(): void {
    this.facade.goToStep(1);
  }

  // === Notification Helpers ===

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 5000
    });
  }
}
