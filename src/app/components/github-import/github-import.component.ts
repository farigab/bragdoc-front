import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { StepperModule } from 'primeng/stepper';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../services/auth.service';
import { GithubImportService } from '../../services/github-import.service';

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
    SelectModule
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

  readonly customPrompt = signal('');

  private signalActiveStep = signal<number>(1);

  get activeStep(): number {
    return this.signalActiveStep();
  }

  set activeStep(value: number) {
    this.signalActiveStep.set(value);
  }

  ngOnInit(): void {
    this.checkForSavedToken();
  }

  analyzeAI(): void {
    const prompt = this.customPrompt();
    if (!prompt || prompt.trim().length === 0) {
      this.showError('Please enter a prompt for AI analysis');
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'AI Analysis',
      detail: 'Analyzing...'
    });

    this.result.set({ aiPrompt: prompt, analysis: 'Simulated AI analysis result' });
    this.showSuccess('AI analysis complete');
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
        this.activeStep = 1;
      },
      error: (err: unknown) => {
        this.resetState();
        this.handleError('repos', err);
        this.activeStep = 1;
      }
    });
  }

  startImport(): void {
    const start = this.startDate();
    const end = this.endDate();

    if (!start || !end) {
      this.showError('Please select both start and end dates');
      return;
    }

    if (start > end) {
      this.showError('Start date must be before end date');
      return;
    }

    const selectedRepos = Array.from(this.selectedRepos());
    const repos = selectedRepos.length > 0 ? selectedRepos : this.repositories();

    this.setLoading('import', true);

    this.service.importData({
      repositories: repos,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    }).subscribe({
      next: (response: unknown) => {
        this.result.set(response);
        this.setLoading('import', false);
        this.showSuccess('Import completed successfully');
      },
      error: (err: unknown) => {
        this.handleError('import', err);
      }
    });
  }

  startOver(): void {
    this.resetState();
  }

  private checkForSavedToken(): void {
    this.setLoading('repos', true);
    this.user()?.hasGitHubToken
      ? this.loadRepositories()
      : this.setLoading('repos', false);
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

  selectedPreset = signal<string | null>(null);
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
