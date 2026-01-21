import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ACHIEVEMENT_CATEGORIES, Achievement } from '../../models/achievement.model';
import { AchievementService } from '../../services/achievement.service';
import { CreateAchievementModalComponent } from '../create-achievement-modal/create-achievement-modal.component';

@Component({
  selector: 'app-achievement-list',
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    CreateAchievementModalComponent
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
  protected readonly selectedCategory = new FormControl<string | null>(null);
  protected readonly showCreateModal = signal(false);
  protected readonly editingAchievement = signal<Achievement | null>(null);

  protected readonly categoriesArray = Array.from(ACHIEVEMENT_CATEGORIES);

  protected readonly filteredAchievements = computed(() => {
    const achievementsList = this.achievements();
    const search = this.searchText().toLowerCase();
    const category = this.selectedCategory.value;

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

  protected onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchText.set(target.value);
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

  protected openCreateModal(): void {
    this.editingAchievement.set(null);
    this.showCreateModal.set(true);
  }

  protected openEditModal(achievement: Achievement): void {
    this.editingAchievement.set(achievement);
    this.showCreateModal.set(true);
  }

  protected closeCreateModal(): void {
    this.showCreateModal.set(false);
    this.editingAchievement.set(null);
  }

  protected onAchievementCreated(): void {
    this.closeCreateModal();
    this.loadAchievements();
  }
}
