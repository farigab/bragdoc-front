import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ACHIEVEMENT_CATEGORIES, Achievement } from '../../models/achievement.model';
import { AchievementService } from '../../services/achievement.service';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';

@Component({
    selector: 'app-achievement-form',
    imports: [
        ReactiveFormsModule,
        CardModule,
        ButtonModule,
        InputTextModule,
        TextareaModule,
        DatePickerModule,
        SelectModule,
        ToastModule
    ],
    providers: [MessageService],
    templateUrl: './achievement-form.component.html',
    styleUrls: ['./achievement-form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        'class': 'achievement-form-page'
    }
})
export class AchievementFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly achievementService = inject(AchievementService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  protected readonly form: FormGroup;
  protected readonly isEditMode = signal(false);
  protected readonly achievementId = signal<number | undefined>(undefined);
  protected readonly loading = signal(false);

  protected readonly categoriesArray = Array.from(ACHIEVEMENT_CATEGORIES);

  protected readonly impactLevels = [
    { label: 'Baixo', value: 'Baixo' },
    { label: 'Médio', value: 'Médio' },
    { label: 'Alto', value: 'Alto' },
    { label: 'Muito Alto', value: 'Muito Alto' }
  ];

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: [new Date(), Validators.required],
      category: ['', Validators.required],
      impact: ['', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.achievementId.set(+id);
      this.loadAchievement(+id);
    }
  }

  loadAchievement(id: number) {
    this.loading.set(true);
    this.achievementService.findById(id).subscribe({
      next: (achievement) => {
        this.form.patchValue({
          title: achievement.title,
          description: achievement.description,
          date: new Date(achievement.date),
          category: achievement.category,
          impact: achievement.impact
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading achievement:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar achievement'
        });
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const formValue = this.form.value;
    const achievement: Achievement = {
      ...formValue,
      date: this.formatDate(formValue.date)
    };

    const request = this.isEditMode()
      ? this.achievementService.update(this.achievementId()!, achievement)
      : this.achievementService.create(achievement);

    request.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Achievement ${this.isEditMode() ? 'atualizado' : 'criado'} com sucesso`
        });
        setTimeout(() => {
          this.router.navigate(['/achievements']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error saving achievement:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: `Erro ao ${this.isEditMode() ? 'atualizar' : 'criar'} achievement`
        });
        this.loading.set(false);
      }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  cancel() {
    this.router.navigate(['/achievements']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
