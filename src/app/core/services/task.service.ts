import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { CreateTaskDto, Priority, Task, TaskStatus } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  readonly tasks = signal<Task[]>([]);
  readonly searchQuery = signal('');
  readonly priorityFilter = signal<Priority | 'all'>('all');

  readonly filteredTasks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const priority = this.priorityFilter();
    return this.tasks().filter((task) => {
      const matchesSearch = !query || task.title.toLowerCase().includes(query);
      const matchesPriority = priority === 'all' || task.priority === priority;
      return matchesSearch && matchesPriority;
    });
  });

  readonly todoTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === 'todo'),
  );

  readonly inProgressTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === 'in-progress'),
  );

  readonly doneTasks = computed(() =>
    this.filteredTasks().filter((t) => t.status === 'done'),
  );

  loadTasks(): Observable<Task[]> {
    const userId = this.authService.currentUser()?.id;
    return this.http
      .get<Task[]>(`${environment.apiUrl}/tasks?userId=${userId}`)
      .pipe(tap((tasks) => this.tasks.set(tasks)));
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http
      .post<Task>(`${environment.apiUrl}/tasks`, task)
      .pipe(tap((created) => this.tasks.update((list) => [...list, created])));
  }

  updateTask(id: number, changes: Partial<Pick<Task, 'status' | 'title' | 'priority'>>): Observable<Task> {
    return this.http
      .patch<Task>(`${environment.apiUrl}/tasks/${id}`, changes)
      .pipe(
        tap((updated) =>
          this.tasks.update((list) => list.map((t) => (t.id === id ? updated : t))),
        ),
      );
  }

  deleteTask(id: number): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/tasks/${id}`)
      .pipe(tap(() => this.tasks.update((list) => list.filter((t) => t.id !== id))));
  }
}
