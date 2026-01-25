import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { ToastModule } from 'primeng/toast';
import { finalize } from 'rxjs';
import { AICustomSummaryRequest, AISummaryReport, ReportType } from '../../models/report.model';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { AuthService } from '../../services/auth.service';
import { GithubImportService } from '../../services/github-import.service';
import { ReportService } from '../../services/report.service';

interface LoadingState {
  prs: boolean;
  issues: boolean;
  commits: boolean;
  repos: boolean;
  import: boolean;
}

interface PresetOption {
  label: string;
  value: Preset;
}

interface ReportTypeOption {
  label: string;
  value: ReportType;
  description: string;
}

type Preset =
  | 'today'
  | 'yesterday'
  | 'thisWeek'
  | 'lastWeek'
  | 'last2Weeks'
  | 'thisMonth'
  | 'lastMonth'
  | 'last3Months'
  | 'last6Months'
  | 'thisYear'
  | 'lastYear';


type LoadingKey = keyof LoadingState;

@Component({
  selector: 'app-github-import',
  imports: [
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    DatePickerModule,
    ToastModule,
    StepperModule,
    SelectModule,
    DialogModule,
    ProgressSpinnerModule,
    MarkdownPipe
  ],
  providers: [MessageService],
  templateUrl: './github-import.component.html',
  styleUrls: ['./github-import.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'github-import-page' }
})
export class GithubImportComponent implements OnInit {
  private readonly service = inject(GithubImportService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly reportService = inject(ReportService);

  readonly aiSummary = signal<AISummaryReport | null>(null);
  readonly showAIModal = signal(false);

  readonly token = signal('');
  readonly result = signal<unknown>(null);
  readonly loading = signal<LoadingState>({
    prs: false,
    issues: false,
    commits: false,
    repos: false,
    import: false
  });

  readonly repositories = signal<string[]>([]);
  readonly selectedRepos = signal(new Set<string>());
  readonly startDate = signal<Date | null>(null);
  readonly endDate = signal<Date | null>(null);
  readonly maxDate = new Date();

  readonly hasRepositories = computed(() => this.repositories().length > 0);
  readonly selectedCount = computed(() => this.selectedRepos().size);
  readonly hasDateRange = computed(() => this.startDate() !== null && this.endDate() !== null);
  readonly isImporting = computed(() => this.loading().import);
  readonly user = this.authService.user;

  readonly displayName = computed(() => {
    const u = this.user();
    const name = u?.name ?? u?.login ?? '';
    return name ? name.split(' ')[0] : '';
  });

  readonly customPrompt = signal('');
  readonly maxPromptLength = 1000;
  readonly promptLength = computed(() => this.customPrompt().length);

  readonly selectedReportType = signal<ReportType>('EXECUTIVE');
  readonly reportTypeOptions: ReportTypeOption[] = [
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
  ];

  private signalActiveStep = signal<number>(1);
  readonly maxReachedStep = signal<number>(1);

  get activeStep(): number {
    return this.signalActiveStep();
  }

  set activeStep(value: number) {
    this.signalActiveStep.set(value);
    this.maxReachedStep.update(m => (value > m ? value : m));
  }

  ngOnInit(): void {
    this.checkForSavedToken();
  }

  goToStep(step: number): void {
    if (!this.canGoTo(step)) {
      return;
    }

    this.activeStep = step;
  }

  canGoTo(step: number): boolean {
    return step <= this.maxReachedStep();
  }

  private readonly MAX_PROMPT_LENGTH = 1000;

  analyzeAI(): void {
    const prompt = this.customPrompt().trim();

    if (prompt.length > this.MAX_PROMPT_LENGTH) {
      this.showError(`Prompt exceeds maximum length of ${this.MAX_PROMPT_LENGTH} characters`);
      return;
    }

    const preset = this.selectedPreset();
    if (!preset) {
      this.showError('Please select a time period preset before running AI analysis');
      return;
    }

    const range = this.presetMap[preset]();
    const selectedRepos = Array.from(this.selectedRepos());
    const repos = selectedRepos.length > 0 ? selectedRepos : this.repositories();

    const request: AICustomSummaryRequest = {
      startDate: this.formatDate(range.start),
      endDate: this.formatDate(range.end),
      userPrompt: prompt,
      repositories: repos,
      reportType: this.selectedReportType()
    };

    this.messageService.add({
      severity: 'info',
      summary: 'AI Analysis',
      detail: 'Analyzing...'
    });

    this.setLoading('import', true);

    this.reportService.getAICustomSummary(request).pipe(
      finalize(() => this.setLoading('import', false))
    ).subscribe({
      next: (report: AISummaryReport) => {
        this.aiSummary.set(report);
        this.showAIModal.set(true);
        this.showSuccess('AI analysis complete');
      },
      error: (err: unknown) => {
        this.handleError('import', err);
      }
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]!;
  }

  saveToken(): void {
    const token = this.token();
    if (!token) {
      this.showError('Token is required');
      return;
    }

    this.setLoading('repos', true);
    this.authService.saveToken(token).subscribe({
      next: () => {
        this.loadRepositories();
      },
      error: (err: unknown) => {
        this.handleError('repos', err);
      }
    });
  }

  selectAll(): void {
    this.selectedRepos.set(new Set(this.repositories()));
  }

  clearSelection(): void {
    this.selectedRepos.set(new Set());
  }

  toggleSelection(repo: string): void {
    this.selectedRepos.update(set => {
      const newSet = new Set(set);
      if (newSet.has(repo)) {
        newSet.delete(repo);
      } else {
        newSet.add(repo);
      }
      return newSet;
    });
  }

  clearToken(): void {
    this.setLoading('repos', true);
    this.authService.clearToken().subscribe({
      next: () => {
        this.resetState();
        this.setLoading('repos', false);
        this.maxReachedStep.set(1);
        this.activeStep = 1;
      },
      error: (err: unknown) => {
        this.resetState();
        this.handleError('repos', err);
        this.maxReachedStep.set(1);
        this.activeStep = 1;
      }
    });
  }

  startOver(): void {
    this.resetState();
  }

  private checkForSavedToken(): void {
    this.setLoading('repos', true);

    if (this.user()?.hasGitHubToken) {
      return this.loadRepositories();
    }

    this.setLoading('repos', false);
  }

  private loadRepositories(): void {
    this.setLoading('repos', true);
    this.service.importRepositories(this.token()).subscribe({
      next: (repos: string[] | null) => {
        this.repositories.set(repos ?? []);
        this.activeStep = 2;
        this.setLoading('repos', false);
      },
      error: (err: unknown) => {
        this.handleError('repos', err);
      }
    });
  }

  private resetState(): void {
    this.token.set('');
    this.repositories.set([]);
    this.selectedRepos.set(new Set());
    this.startDate.set(null);
    this.endDate.set(null);
    this.result.set(null);
    this.maxReachedStep.set(1);
  }

  private setLoading(key: LoadingKey, value: boolean): void {
    this.loading.update(state => ({ ...state, [key]: value }));
  }

  private handleError(key: LoadingKey, error: unknown): void {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    this.showError(message);
    this.setLoading(key, false);
  }

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

  selectedPreset = signal<Preset | null>(null);
  presetOptions: PresetOption[] = [
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
  ];

  selectPreset(preset: Preset): void {
    this.selectedPreset.set(preset);

    const range = this.presetMap[preset]?.();

    if (!range) {
      this.startDate.set(null);
      this.endDate.set(null);
      return;
    }

    this.startDate.set(range.start);
    this.endDate.set(range.end);
  }

  private readonly presetMap: Record<Preset, () => { start: Date; end: Date }> = {
    today: () => {
      const d = this.today();
      return { start: d, end: d };
    },

    yesterday: () => {
      const d = this.today();
      d.setDate(d.getDate() - 1);
      return { start: d, end: d };
    },

    thisWeek: () => {
      const end = this.today();
      return { start: this.startOfWeek(end), end };
    },

    lastWeek: () => {
      const end = this.startOfWeek(this.today());
      end.setDate(end.getDate() - 1);
      const start = this.startOfWeek(end);
      return { start, end };
    },

    last2Weeks: () => {
      const end = this.today();
      const start = new Date(end);
      start.setDate(start.getDate() - 13);
      return { start, end };
    },

    thisMonth: () => {
      const end = this.today();
      return { start: new Date(end.getFullYear(), end.getMonth(), 1), end };
    },

    lastMonth: () => {
      const end = new Date(this.today().getFullYear(), this.today().getMonth(), 0);
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      return { start, end };
    },

    last3Months: () => {
      const end = this.today();
      return { start: new Date(end.getFullYear(), end.getMonth() - 3, 1), end };
    },

    last6Months: () => {
      const end = this.today();
      return { start: new Date(end.getFullYear(), end.getMonth() - 6, 1), end };
    },

    thisYear: () => {
      const end = this.today();
      return { start: new Date(end.getFullYear(), 0, 1), end };
    },

    lastYear: () => {
      const year = this.today().getFullYear() - 1;
      return {
        start: new Date(year, 0, 1),
        end: new Date(year, 11, 31)
      };
    }
  };

  private today(): Date {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private startOfWeek(date: Date): Date {
    const d = new Date(date);
    const diff = d.getDay() === 0 ? 6 : d.getDay() - 1;
    d.setDate(d.getDate() - diff);
    return this.todayFrom(d);
  }

  private todayFrom(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}
