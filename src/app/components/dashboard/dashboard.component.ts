import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { SummaryReport } from '../../models/report.model';
import { ReportService } from '../../services/report.service';
import { CreateAchievementModalComponent } from '../create-achievement-modal/create-achievement-modal.component';

@Component({
    selector: 'app-dashboard',
    imports: [DatePipe, RouterLink, CardModule, ButtonModule, ChartModule, SkeletonModule, TagModule, CreateAchievementModalComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'dashboard-page'
    }
})
export class DashboardComponent implements OnInit {
  private readonly reportService = inject(ReportService);

  protected readonly summary = signal<SummaryReport | null>(null);
  protected readonly categoryChartData = signal<any>(null);
  protected readonly categoryChartOptions = signal<any>(null);
  protected readonly loading = signal(true);
  protected readonly showCreateModal = signal(false);

  protected readonly categoryEntries = computed(() => {
    const summaryValue = this.summary();
    if (!summaryValue?.by_category) return [];
    return Object.entries(summaryValue.by_category);
  });

  protected readonly topCategories = computed(() => {
    const entries = this.categoryEntries();
    return entries.sort(([, a], [, b]) => b - a).slice(0, 5);
  });

  ngOnInit(): void {
    this.loadSummary();
  }

  private loadSummary(): void {
    this.reportService.getSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
        this.setupCategoryChart(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading summary:', error);
        this.loading.set(false);
      }
    });
  }

  private setupCategoryChart(summaryData: SummaryReport): void {
    if (!summaryData?.by_category) return;

    const labels = Object.keys(summaryData.by_category);
    const data = Object.values(summaryData.by_category);

    this.categoryChartData.set({
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(0, 122, 255, 0.8)',
            'rgba(52, 199, 89, 0.8)',
            'rgba(255, 149, 0, 0.8)',
            'rgba(255, 59, 48, 0.8)',
            'rgba(175, 82, 222, 0.8)',
            'rgba(255, 204, 0, 0.8)'
          ],
          borderColor: [
            'rgb(0, 122, 255)',
            'rgb(52, 199, 89)',
            'rgb(255, 149, 0)',
            'rgb(255, 59, 48)',
            'rgb(175, 82, 222)',
            'rgb(255, 204, 0)'
          ],
          borderWidth: 2
        }
      ]
    });

    this.categoryChartOptions.set({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              family: '-apple-system, BlinkMacSystemFont, SF Pro Text',
              size: 13
            },
            padding: 16,
            usePointStyle: true
          }
        }
      }
    });
  }

  protected getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      technical: 'pi-code',
      leadership: 'pi-users',
      innovation: 'pi-lightbulb',
      collaboration: 'pi-comments',
      learning: 'pi-book',
      other: 'pi-star'
    };
    return icons[category.toLowerCase()] || 'pi-star';
  }

  protected openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  protected closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  protected onAchievementCreated(): void {
    this.closeCreateModal();
    this.loadSummary(); // Recarregar o summary após criar
  }
}
