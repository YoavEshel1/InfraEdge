import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { Task, TaskStatus } from '../models/task.model';
import { TaskStatusVisuals } from '../models/task-status-visuals.model';
import { TaskPriorityVisuals } from '../models/task-priority-visuals.model';
import { TaskService } from '../task.service';
import { ConfirmDialogComponent } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { TASK_STATUS_VISUALS, PRIORITY_FILTERS } from '../task-consts';

@Component({
  selector: 'app-task-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass, MatButtonModule, MatDivider, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  readonly task = input.required<Task>();
  private readonly taskService = inject(TaskService);
  private readonly dialog = inject(MatDialog);

  readonly statuses: TaskStatusVisuals[] = TASK_STATUS_VISUALS;

  private get currentPriority(): TaskPriorityVisuals | undefined {
    return PRIORITY_FILTERS.find((p) => p.value === this.task().priority);
  }

  get priorityLabel(): string {
    return this.currentPriority?.label ?? this.task().priority;
  }

  get priorityClass(): string {
    return this.currentPriority?.borderClass ?? '';
  }

  onStatusChange(status: TaskStatus): void {
    this.taskService.updateTask(this.task().id, { status }).subscribe();
  }

  onDelete(): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '360px',
        direction: 'rtl',
        data: { title: 'מחיקת משימה', message: `האם למחוק את "${this.task().title}"?`, confirmLabel: 'מחק' },
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) this.taskService.deleteTask(this.task().id).subscribe();
      });
  }
}
