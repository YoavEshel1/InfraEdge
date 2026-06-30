import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Priority, Task, TaskStatus } from '../models/task.model';
import { TaskStatusVisuals } from '../models/task-status-visuals.model';
import { TASK_STATUS_VISUALS } from '../task-consts';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.scss',
})
export class TaskModalComponent {
  private readonly dialogRef = inject(MatDialogRef<TaskModalComponent>);
  private readonly data = inject<{ status?: TaskStatus; task?: Task }>(MAT_DIALOG_DATA, { optional: true });
  private readonly fb = inject(FormBuilder);

  readonly isEditMode = !!this.data?.task;

  readonly form = this.fb.group({
    title:       [this.data?.task?.title       ?? '',        [Validators.required, Validators.minLength(2)]],
    description: [this.data?.task?.description ?? ''],
    status:      [(this.data?.task?.status     ?? this.data?.status ?? 'todo') as TaskStatus],
    priority:    [(this.data?.task?.priority   ?? 'medium') as Priority],
  });

  readonly statuses: TaskStatusVisuals[] = TASK_STATUS_VISUALS;

  get selectedStatus(): TaskStatusVisuals | undefined {
    return this.statuses.find((s) => s.status === this.form.controls.status.value);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
