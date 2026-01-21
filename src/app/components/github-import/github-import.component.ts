import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { GithubImportService } from '../../services/github-import.service';

@Component({
  selector: 'app-github-import',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ToastModule
  ],
  templateUrl: './github-import.component.html',
  styleUrls: ['./github-import.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'class': 'github-import-page' }
})
export class GithubImportComponent {
  private readonly service = inject(GithubImportService);

  readonly repository = signal('');
  readonly token = signal('');
  readonly minChanges = signal(1);

  readonly result = signal<any | null>(null);
  readonly loading = signal({
    prs: false,
    issues: false,
    commits: false,
    repos: false
  });

  importPullRequests(): void {
    this.setLoading('prs', true);

    this.service
      .importPullRequests(this.repository(), this.token() || undefined)
      .subscribe(this.handleResponse('prs'));
  }

  importIssues(): void {
    this.setLoading('issues', true);

    this.service
      .importIssues(this.repository(), this.token() || undefined)
      .subscribe(this.handleResponse('issues'));
  }

  importCommits(): void {
    this.setLoading('commits', true);

    this.service
      .importCommits(
        this.repository(),
        this.minChanges(),
        this.token() || undefined
      )
      .subscribe(this.handleResponse('commits'));
  }

  importRepositories(): void {
    this.setLoading('repos', true);

    this.service
      .importRepositories(this.token() || undefined)
      .subscribe(this.handleResponse('repos'));
  }

  private setLoading(
    key: keyof ReturnType<typeof this.loading>,
    value: boolean
  ) {
    this.loading.update(l => ({ ...l, [key]: value }));
  }

  private handleResponse(key: keyof ReturnType<typeof this.loading>) {
    return {
      next: (res: any) => {
        this.result.set(res);
        this.setLoading(key, false);
      },
      error: (err: any) => {
        this.result.set({ error: err.message ?? err });
        this.setLoading(key, false);
      }
    };
  }
}
