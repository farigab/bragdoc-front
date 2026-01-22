import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { GithubImportService } from '../../services/github-import.service';
import { ReportsComponent } from '../reports/reports.component';
import { AuthService } from '../../services/auth.service';

interface LoadingState {
  prs: boolean;
  issues: boolean;
  commits: boolean;
  repos: boolean;
  import: boolean;
}

type LoadingKey = keyof LoadingState;

type ImportStep = 'token' | 'repositories' | 'dateRange' | 'complete';

@Component({
  selector: 'app-github-import',
  imports: [
    FormsModule,
    JsonPipe,
    ButtonModule,
    CardModule,
    InputTextModule,
    DatePickerModule,
    ToastModule,
    ReportsComponent
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

  readonly currentStep = signal<ImportStep>('token');
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

  ngOnInit(): void {
    this.checkForSavedToken();
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

  continueToDateRange(): void {
    this.currentStep.set('dateRange');
  }

  backToRepositories(): void {
    this.currentStep.set('repositories');
  }

  clearToken(): void {
    this.setLoading('repos', true);
    this.authService.clearToken().subscribe({
      next: () => {
        this.resetState();
        this.setLoading('repos', false);
      },
      error: (err: unknown) => {
        this.resetState();
        this.handleError('repos', err);
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
        this.currentStep.set('complete');
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
    this.currentStep.set('token');
  }

  private checkForSavedToken(): void {
    this.setLoading('repos', true);
    this.service.importRepositories().subscribe({
      next: (repos: string[] | null) => {
        if (repos && repos.length > 0) {
          this.repositories.set(repos);
          this.currentStep.set('repositories');
        }
        this.setLoading('repos', false);
      },
      error: () => {
        this.setLoading('repos', false);
      }
    });
  }

  private loadRepositories(): void {
    this.setLoading('repos', true);
    this.service.importRepositories(this.token()).subscribe({
      next: (repos: string[] | null) => {
        this.repositories.set(repos ?? []);
        this.currentStep.set('repositories');
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
}
