import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { AICustomSummaryRequest, AISummaryReport, ReportType } from '../../models/report.model';
import { AuthService } from '../../services/auth.service';
import { GithubImportService } from '../../services/github-import.service';
import { ReportService } from '../../services/report.service';


export type Preset =
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

interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

interface LoadingState {
  repos: boolean;
  import: boolean;
}

/**
 * Facade para gerenciar toda a lógica de negócio do GitHub Import
 * Separa a lógica de apresentação (component) da lógica de negócio
 */
@Injectable()
export class GithubImportFacade {
  private readonly githubService = inject(GithubImportService);
  private readonly reportService = inject(ReportService);
  private readonly authService = inject(AuthService);

  // === Estado ===
  readonly token = signal('');
  readonly repositories = signal<string[]>([]);
  readonly selectedRepos = signal(new Set<string>());
  readonly selectedPreset = signal<Preset | null>(null);
  readonly customPrompt = signal('');
  readonly selectedReportType = signal<ReportType>('EXECUTIVE');
  readonly aiSummary = signal<AISummaryReport | null>(null);
  readonly showAIModal = signal(false);

  readonly loading = signal<LoadingState>({
    repos: false,
    import: false
  });

  readonly activeStep = signal(1);
  readonly maxReachedStep = signal(1);

  // === Computed ===
  readonly user = this.authService.user;
  readonly hasRepositories = computed(() => this.repositories().length > 0);
  readonly selectedCount = computed(() => this.selectedRepos().size);
  readonly hasDateRange = computed(() => this.selectedPreset() !== null);
  readonly promptLength = computed(() => this.customPrompt().length);
  readonly displayName = computed(() => {
    const u = this.user();
    const name = u?.name ?? u?.login ?? '';
    return name ? name.split(' ')[0] : '';
  });

  // === Preset Configuration ===
  private readonly presetMap: Record<Preset, () => DateRange> = {
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
      return { start: new Date(year, 0, 1), end: new Date(year, 11, 31) };
    }
  };

  // === Actions ===

  saveToken(onSuccess: () => void, onError: (msg: string) => void): void {
    const token = this.token();
    if (!token) {
      onError('Token is required');
      return;
    }

    this.setLoading('repos', true);
    this.authService.saveToken(token).subscribe({
      next: () => {
        this.loadRepositories(onSuccess, onError);
      },
      error: (err: unknown) => {
        this.setLoading('repos', false);
        const msg = err instanceof Error ? err.message : 'Failed to save token';
        onError(msg);
      }
    });
  }

  loadRepositories(onSuccess: () => void, onError: (msg: string) => void): void {
    this.setLoading('repos', true);
    this.githubService.importRepositories(this.token()).subscribe({
      next: (repos: string[] | null) => {
        this.repositories.set(repos ?? []);
        this.goToStep(2, true);
        this.setLoading('repos', false);
        onSuccess();
      },
      error: (err: unknown) => {
        this.setLoading('repos', false);
        const msg = err instanceof Error ? err.message : 'Failed to load repositories';
        onError(msg);
      }
    });
  }

  clearToken(onSuccess: () => void, onError: (msg: string) => void): void {
    this.setLoading('repos', true);
    this.authService.clearToken().subscribe({
      next: () => {
        this.resetState();
        this.setLoading('repos', false);
        onSuccess();
      },
      error: (err: unknown) => {
        this.resetState();
        this.setLoading('repos', false);
        const msg = err instanceof Error ? err.message : 'Failed to clear token';
        onError(msg);
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

  selectPreset(preset: Preset): void {
    this.selectedPreset.set(preset);
  }

  analyzeAI(
    maxPromptLength: number,
    onSuccess: () => void,
    onError: (msg: string) => void
  ): void {
    const prompt = this.customPrompt().trim();

    if (prompt.length > maxPromptLength) {
      onError(`Prompt exceeds maximum length of ${maxPromptLength} characters`);
      return;
    }

    const preset = this.selectedPreset();
    if (!preset) {
      onError('Please select a time period preset');
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

    this.setLoading('import', true);

    this.reportService.getAICustomSummary(request).pipe(
      finalize(() => this.setLoading('import', false))
    ).subscribe({
      next: (report: AISummaryReport) => {
        this.aiSummary.set(report);
        this.showAIModal.set(true);
        onSuccess();
      },
      error: (err: unknown) => {
        const msg = err instanceof Error ? err.message : 'AI analysis failed';
        onError(msg);
      }
    });
  }

  goToStep(step: number, force: boolean = false): void {
    if (!force && !this.canGoTo(step)) {
      return;
    }

    this.activeStep.set(step);
    this.maxReachedStep.update(m => (step > m ? step : m));
  }

  canGoTo(step: number): boolean {
    const canGo = step <= this.maxReachedStep();
    return canGo;
  }

  checkForSavedToken(): void {
    this.setLoading('repos', true);

    if (this.user()?.hasGitHubToken) {
      this.loadRepositories(
        () => { },
        () => this.setLoading('repos', false)
      );
    } else {
      this.setLoading('repos', false);
    }
  }

  // === Private Helpers ===

  private resetState(): void {
    this.token.set('');
    this.repositories.set([]);
    this.selectedRepos.set(new Set());
    this.selectedPreset.set(null);
    this.customPrompt.set('');
    this.maxReachedStep.set(1);
    this.activeStep.set(1);
  }

  private setLoading(key: keyof LoadingState, value: boolean): void {
    this.loading.update(state => ({ ...state, [key]: value }));
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]!;
  }

  private today(): Date {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private startOfWeek(date: Date): Date {
    const d = new Date(date);
    const diff = d.getDay() === 0 ? 6 : d.getDay() - 1;
    d.setDate(d.getDate() - diff);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}
