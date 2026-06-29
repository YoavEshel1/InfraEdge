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

import { Priority, TaskStatus } from '../models/task.model';
import { MatIcon } from "@angular/material/icon";

interface StatusOption {
  value: TaskStatus;
  label: string;
  colorClass: string;
}

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
    MatIcon
],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.scss',
})
export class TaskModalComponent {
  private readonly dialogRef = inject(MatDialogRef<TaskModalComponent>);
  // Injecting optional data passed to the dialog, which may include a default status for the new task
  private readonly data = inject<{ status?: TaskStatus }>(MAT_DIALOG_DATA, { optional: true });
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    status: [(this.data?.status ?? 'todo') as TaskStatus],
    priority: ['medium' as Priority],
  });

  readonly statuses: StatusOption[] = [
    { value: 'todo',        label: 'לעשות',  colorClass: 'dot-brand' },
    { value: 'in-progress', label: 'בתהליך', colorClass: 'dot-medium' },
    { value: 'done',        label: 'הושלם',  colorClass: 'dot-low' },
  ];

  get selectedStatus(): StatusOption | undefined {
    return this.statuses.find((s) => s.value === this.form.controls.status.value);
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
