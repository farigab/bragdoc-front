import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { TimelineReport } from '../../models/report.model';
import { ReportService } from '../../services/report.service';

@Component({
    selector: 'app-timeline',
    imports: [DatePipe, CardModule, TimelineModule, TagModule],
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent implements OnInit {
  private reportService = inject(ReportService);

  timelineData = signal<TimelineReport | null>(null);
  loading = signal(true);

  timelineEvents = computed(() => {
    const data = this.timelineData();
    if (!data?.timeline) return [];

    return Object.entries(data.timeline).map(([year, achievements]) => ({
      year,
      achievements,
      count: achievements.length
    }));
  });

  ngOnInit() {
    this.loadTimeline();
  }

  loadTimeline() {
    this.reportService.getTimeline().subscribe({
      next: (data) => {
        this.timelineData.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading timeline:', error);
        this.loading.set(false);
      }
    });
  }

  getCategoryColor(category: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    const colors: { [key: string]: 'success' | 'secondary' | 'info' | 'warn' | 'danger' } = {
      'GitHub - Pull Request': 'success',
      'GitHub - Issue': 'info',
      'GitHub - Commit': 'warn',
      'GitHub - Repository': 'danger'
    };
    return colors[category] || 'secondary';
  }
}
