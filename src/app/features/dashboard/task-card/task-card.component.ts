import { Component, inject, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { Priority, Task, TaskStatus } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

interface StatusOption {
  value: TaskStatus;
  label: string;
}

interface PriorityConfig {
  label: string;
  cssClass: string;
}

const PRIORITY_MAP: Record<Priority, PriorityConfig> = {
  high: { label: 'גבוהה', cssClass: 'priority-high' },
  medium: { label: 'בינונית', cssClass: 'priority-medium' },
  low: { label: 'נמוכה', cssClass: 'priority-low' },
};

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [NgClass, MatButtonModule, MatDivider, MatFormFieldModule, MatIconModule, MatSelectModule],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  readonly task = input.required<Task>();
  private readonly taskService = inject(TaskService);

  readonly statuses: StatusOption[] = [
    { value: 'todo', label: 'לעשות' },
    { value: 'in-progress', label: 'בתהליך' },
    { value: 'done', label: 'הושלם' },
  ];

  get priorityLabel(): string {
    return PRIORITY_MAP[this.task().priority]?.label ?? this.task().priority;
  }

  get priorityClass(): string {
    return PRIORITY_MAP[this.task().priority]?.cssClass ?? '';
  }

  onStatusChange(status: TaskStatus): void {
    this.taskService.updateTask(this.task().id, { status }).subscribe();
  }

  onDelete(): void {
    this.taskService.deleteTask(this.task().id).subscribe();
  }
}
