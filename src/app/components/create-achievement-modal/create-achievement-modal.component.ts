import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ACHIEVEMENT_CATEGORIES, Achievement } from '../../models/achievement.model';
import { AchievementService } from '../../services/achievement.service';

@Component({
  selector: 'app-create-achievement-modal',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    SelectModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './create-achievement-modal.component.html',
  styleUrls: ['./create-achievement-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'create-achievement-modal'
  }
})
export class CreateAchievementModalComponent {
  private readonly fb = inject(FormBuilder);
  private readonly achievementService = inject(AchievementService);
  private readonly messageService = inject(MessageService);

  protected readonly form: FormGroup;
  protected readonly loading = signal(false);

  // Inputs
  isOpen = input<boolean>(false);
  achievementToEdit = input<Achievement | null>(null);

  protected readonly categoriesArray = Array.from(ACHIEVEMENT_CATEGORIES);

  protected readonly impactLevels = [
    { label: 'Baixo', value: 'Baixo' },
    { label: 'Médio', value: 'Médio' },
    { label: 'Alto', value: 'Alto' },
    { label: 'Muito Alto', value: 'Muito Alto' }
  ];

  // Outputs
  protected readonly onClose = output<void>();
  protected readonly onSave = output<Achievement>();

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      date: [new Date(), Validators.required],
      category: ['', Validators.required],
      impact: ['', Validators.required]
    });

    effect(() => {
      if (this.isOpen()) {
        const editAchievement = this.achievementToEdit();
        if (editAchievement) {
          this.form.patchValue({
            title: editAchievement.title,
            description: editAchievement.description,
            date: new Date(editAchievement.date),
            category: editAchievement.category,
            impact: editAchievement.impact
          });
        } else {
          this.form.reset({
            title: '',
            description: '',
            date: new Date(),
            category: '',
            impact: ''
          });
        }
      }
    });
  }

  close() {
    this.onClose.emit();
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

    const editAchievement = this.achievementToEdit();
    if (editAchievement && editAchievement.id) {
      this.achievementService.update(editAchievement.id, achievement).subscribe({
        next: (updatedAchievement) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Achievement atualizado com sucesso'
          });
          this.loading.set(false);
          this.onSave.emit(updatedAchievement);
          this.close();
        },
        error: (error) => {
          console.error('Error updating achievement:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar achievement'
          });
          this.loading.set(false);
        }
      });
    } else {
      this.achievementService.create(achievement).subscribe({
        next: (createdAchievement) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Achievement criado com sucesso'
          });
          this.loading.set(false);
          this.onSave.emit(createdAchievement);
          this.close();
        },
        error: (error) => {
          console.error('Error creating achievement:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar achievement'
          });
          this.loading.set(false);
        }
      });
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
