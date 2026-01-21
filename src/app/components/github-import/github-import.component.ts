import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { GithubImportService } from '../../services/github-import.service';

interface LoadingState {
  prs: boolean;
  issues: boolean;
  commits: boolean;
  repos: boolean;
}

type LoadingKey = keyof LoadingState;

@Component({
  selector: 'app-github-import',
  imports: [
    CommonModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    ToastModule
  ],
  templateUrl: './github-import.component.html',
  styleUrls: ['./github-import.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'github-import-page' }
})
export class GithubImportComponent implements OnInit {
  private readonly service = inject(GithubImportService);

  readonly token = signal('');
  readonly result = signal<unknown>(null);
  readonly loading = signal<LoadingState>({
    prs: false,
    issues: false,
    commits: false,
    repos: false
  });

  readonly repositories = signal<string[]>([]);
  readonly selectedRepos = signal(new Set<string>());

  // Computed para facilitar verificações
  readonly hasRepositories = computed(() => this.repositories().length > 0);
  readonly selectedCount = computed(() => this.selectedRepos().size);

  ngOnInit(): void {
    this.checkForSavedToken();
  }

  saveToken(): void {
    const token = this.token();
    if (!token) {
      this.result.set({ error: 'Token is empty' });
      return;
    }

    this.setLoading('repos', true);
    this.service.saveToken(token).subscribe({
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

  continueWithSelection(): void {
    const selected = Array.from(this.selectedRepos());
    // Se nenhum selecionado, usa todos
    const payload = selected.length > 0 ? selected : this.repositories();
    this.result.set({ selected: payload });
  }

  private checkForSavedToken(): void {
    this.setLoading('repos', true);
    this.service.importRepositories().subscribe({
      next: (repos: string[] | null) => {
        this.repositories.set(repos ?? []);
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
        this.setLoading('repos', false);
      },
      error: (err: unknown) => {
        this.handleError('repos', err);
      }
    });
  }

  private setLoading(key: LoadingKey, value: boolean): void {
    this.loading.update(state => ({ ...state, [key]: value }));
  }

  private handleError(key: LoadingKey, error: unknown): void {
    const message = error instanceof Error ? error.message : 'Unknown error';
    this.result.set({ error: message });
    this.setLoading(key, false);
  }
}
