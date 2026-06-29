import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { Priority, Task, TaskStatus } from '../task/models/task.model';
import { AuthService } from '../../../core/auth/auth.service';
import { TaskService } from '../task/task.service';
import { TaskCardComponent } from '../task/task-card/task-card.component';
import { TaskModalComponent } from '../task/task-modal/task-modal.component';
import { COLUMNS, PRIORITY_FILTERS } from './board-consts';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-board',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TaskCardComponent,
    MatDividerModule
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  // ── Exposed signals ────────────────────────────────────────────────────────
  readonly currentUser = this.authService.currentUser;
  readonly searchQuery = this.taskService.searchQuery;
  readonly priorityFilter = this.taskService.priorityFilter;
  readonly totalCount = computed(() => this.taskService.tasks().length);
  readonly uniqueStatusCount = computed(() =>
    new Set(this.taskService.tasks().map((t) => t.status)).size
  );

  // ── Static config ──────────────────────────────────────────────────────────
  readonly columns = COLUMNS;
  readonly priorityFilters = PRIORITY_FILTERS;

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.taskService.loadTasks().subscribe();
  }

  // ── Derived helpers ────────────────────────────────────────────────────────
  get userInitials(): string {
    return (this.currentUser()?.name ?? '')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getTasksForStatus(status: TaskStatus): Task[] {
    switch (status) {
      case 'todo':
        return this.taskService.todoTasks();
      case 'in-progress':
        return this.taskService.inProgressTasks();
      case 'done':
        return this.taskService.doneTasks();
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  onSearchChange(query: string): void {
    this.taskService.searchQuery.set(query);
  }

  onPriorityFilter(priority: Priority | 'all'): void {
    this.taskService.priorityFilter.set(priority);
  }

  openNewTaskDialog(status: TaskStatus = 'todo'): void {
    this.dialog
      .open(TaskModalComponent, {
        width: '580px',
        panelClass: 'rounded-dialog',
        direction: 'rtl',
        data: { status }
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;
        this.taskService
          .createTask({ ...result, userId: this.currentUser()!.id })
          .subscribe();
      });
  }

  logout(): void {
    this.authService.logout();
  }
}
