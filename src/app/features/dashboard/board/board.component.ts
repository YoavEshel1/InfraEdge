import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
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

interface Column {
  status: TaskStatus;
  label: string;
  dotColor: string;
}

interface PriorityFilter {
  value: Priority | 'all';
  label: string;
  dotColor?: string;
}

@Component({
  selector: 'app-board',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    TaskCardComponent,
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

  // ── Static config ──────────────────────────────────────────────────────────
  readonly columns: Column[] = [
    { status: 'todo', label: 'לעשות', dotColor: '#e84c1e' },
    { status: 'in-progress', label: 'בתהליך', dotColor: '#f59e0b' },
    { status: 'done', label: 'הושלם', dotColor: '#22c55e' },
  ];

  readonly priorityFilters: PriorityFilter[] = [
    { value: 'all', label: 'הכל' },
    { value: 'high', label: 'גבוהה', dotColor: '#e84c1e' },
    { value: 'medium', label: 'בינונית', dotColor: '#f59e0b' },
    { value: 'low', label: 'נמוכה', dotColor: '#eab308' },
  ];

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

  openNewTaskDialog(): void {
    this.dialog
      .open(TaskModalComponent, { width: '480px', direction: 'rtl' })
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
