import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ACHIEVEMENT_CATEGORIES, Achievement } from '../../models/achievement.model';
import { AchievementService } from '../../services/achievement.service';

@Component({
    selector: 'app-achievement-list',
    imports: [
        DatePipe,
        RouterLink,
        FormsModule,
        TableModule,
        ButtonModule,
        CardModule,
        InputTextModule,
        SelectModule,
        TagModule,
        ConfirmDialogModule,
        ToastModule
    ],
    providers: [ConfirmationService, MessageService],
    templateUrl: './achievement-list.component.html',
    styleUrls: ['./achievement-list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'achievement-list-page'
    }
})
export class AchievementListComponent implements OnInit {
  private readonly achievementService = inject(AchievementService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  protected readonly achievements = signal<Achievement[]>([]);
  protected readonly loading = signal(true);
  protected readonly searchText = signal('');
  protected readonly selectedCategory = signal<string | null>(null);

  protected readonly categoriesArray = Array.from(ACHIEVEMENT_CATEGORIES);

  protected readonly filteredAchievements = computed(() => {
    const achievementsList = this.achievements();
    const search = this.searchText().toLowerCase();
    const category = this.selectedCategory();

    return achievementsList.filter(achievement => {
      const matchesSearch = !search ||
        achievement.title.toLowerCase().includes(search) ||
        achievement.description.toLowerCase().includes(search);

      const matchesCategory = !category || achievement.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  ngOnInit(): void {
    this.loadAchievements();
  }

  private loadAchievements(): void {
    this.loading.set(true);
    this.achievementService.findAll().subscribe({
      next: (data) => {
        this.achievements.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading achievements:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load achievements'
        });
        this.loading.set(false);
      }
    });
  }

  protected onSearchChange(value: string): void {
    this.searchText.set(value);
  }

  protected onCategoryChange(value: string | null): void {
    this.selectedCategory.set(value);
  }

  protected deleteAchievement(achievement: Achievement): void {
    if (!achievement.id) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${achievement.title}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        if (!achievement.id) return;

        this.achievementService.delete(achievement.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Achievement deleted successfully'
            });
            this.loadAchievements();
          },
          error: (error) => {
            console.error('Error deleting achievement:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete achievement'
            });
          }
        });
      }
    });
  }

  protected getCategoryIcon(category: string): string {
    const cat = ACHIEVEMENT_CATEGORIES.find(c => c.value === category);
    return cat?.icon || 'pi pi-star';
  }

  protected getCategorySeverity(category: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger'> = {
      technical: 'info',
      leadership: 'success',
      innovation: 'warn',
      collaboration: 'info',
      learning: 'secondary',
      other: 'secondary'
    };
    return severityMap[category] || 'secondary';
  }
}
