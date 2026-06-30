import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { TaskService } from './task.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Task } from './models/task.model';

const MOCK_TASKS: Task[] = [
  { id: 1, title: 'Task 1', status: 'todo', priority: 'high', userId: 1 },
  { id: 2, title: 'Task 2', status: 'in-progress', priority: 'medium', userId: 1 },
  { id: 3, title: 'Task 3', status: 'done', priority: 'low', userId: 1 },
];

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const mockAuthService = {
      currentUser: signal({ id: 1, name: 'Alice', email: 'alice@example.com', password: '', token: 'tok' }),
    } as unknown as AuthService;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // Tests: that TestBed can instantiate TaskService with its dependencies provided.
  // Expected: the injected TaskService instance is truthy (not null/undefined).
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('loadTasks()', () => {
    // Tests: that loadTasks() sends a GET request filtered by userId and writes the response into the tasks signal.
    // Expected: the observable emits the task array and the tasks signal holds the same data.
    it('should populate the tasks signal with API response', () => {
      let loaded: Task[] | undefined;
      service.loadTasks().subscribe((tasks) => (loaded = tasks));
      httpMock.expectOne('/api/tasks?userId=1').flush(MOCK_TASKS);

      expect(loaded).toEqual(MOCK_TASKS);
      expect(service.tasks()).toEqual(MOCK_TASKS);
    });
  });

  describe('computed signals', () => {
    beforeEach(() => service.tasks.set([...MOCK_TASKS]));

    // Tests: that the computed signals todoTasks, inProgressTasks, and doneTasks each correctly partition the tasks array by status.
    // Expected: one task in each bucket when tasks contains exactly one task per status.
    it('should group tasks by status', () => {
      expect(service.todoTasks().length).toBe(1);
      expect(service.inProgressTasks().length).toBe(1);
      expect(service.doneTasks().length).toBe(1);
    });

    // Tests: that filteredTasks() returns every task when priorityFilter is set to the 'all' sentinel value.
    // Expected: filteredTasks length equals the full tasks array length (no tasks are excluded).
    it('should return all tasks when priorityFilter is "all"', () => {
      service.priorityFilter.set('all');
      expect(service.filteredTasks().length).toBe(MOCK_TASKS.length);
    });

    // Tests: that filteredTasks() narrows results to only tasks whose priority matches the active filter.
    // Expected: only the one 'high'-priority task is returned when the filter is set to 'high'.
    it('should filter tasks by priority', () => {
      service.priorityFilter.set('high');
      expect(service.filteredTasks().length).toBe(1);
      expect(service.filteredTasks()[0].priority).toBe('high');
    });

    // Tests: that filteredTasks() performs a case-insensitive title search against the active searchQuery.
    // Expected: only the task whose title contains 'task 1' (case-insensitive) is returned.
    it('should filter tasks by search query (case-insensitive)', () => {
      service.searchQuery.set('task 1');
      expect(service.filteredTasks().length).toBe(1);
      expect(service.filteredTasks()[0].id).toBe(1);
    });

    // Tests: that filteredTasks() returns an empty array when the search query matches no task title.
    // Expected: filteredTasks length is 0 for a query that does not exist in any task title.
    it('should return empty when search query has no match', () => {
      service.searchQuery.set('nonexistent');
      expect(service.filteredTasks().length).toBe(0);
    });

    // Tests: that filteredTasks() applies both priorityFilter and searchQuery simultaneously (AND logic).
    // Expected: only one task matches both 'high' priority and the title containing 'Task'.
    it('should combine search and priority filters', () => {
      service.priorityFilter.set('high');
      service.searchQuery.set('Task');
      expect(service.filteredTasks().length).toBe(1);
      expect(service.filteredTasks()[0].priority).toBe('high');
    });
  });

  describe('createTask()', () => {
    // Tests: that createTask() POSTs the DTO to the API and appends the server-returned task to the tasks signal.
    // Expected: after the request resolves, the tasks signal contains the newly created task object.
    it('should append created task to the tasks signal', () => {
      service.tasks.set([]);
      const dto = { title: 'New', status: 'todo' as const, priority: 'medium' as const, userId: 1 };
      const created: Task = { id: 10, ...dto };

      service.createTask(dto).subscribe();
      httpMock.expectOne('/api/tasks').flush(created);

      expect(service.tasks()).toContain(created);
    });
  });

  describe('updateTask()', () => {
    // Tests: that updateTask() sends a PATCH to the correct endpoint and replaces the matching task in the signal.
    // Expected: after the request resolves, the task with the given id has its status updated to 'done'.
    it('should update matching task in the signal', () => {
      service.tasks.set([...MOCK_TASKS]);
      const updated: Task = { ...MOCK_TASKS[0], status: 'done' };

      service.updateTask(1, { status: 'done' }).subscribe();
      httpMock.expectOne('/api/tasks/1').flush(updated);

      expect(service.tasks().find((t) => t.id === 1)?.status).toBe('done');
    });
  });

  describe('deleteTask()', () => {
    // Tests: that deleteTask() sends a DELETE to the correct endpoint and removes the task from the in-memory signal.
    // Expected: after the request resolves, the task with the given id is absent from the tasks signal and the array is one element shorter.
    it('should remove task from the signal', () => {
      service.tasks.set([...MOCK_TASKS]);

      service.deleteTask(1).subscribe();
      httpMock.expectOne('/api/tasks/1').flush(null);

      expect(service.tasks().find((t) => t.id === 1)).toBeUndefined();
      expect(service.tasks().length).toBe(MOCK_TASKS.length - 1);
    });
  });
});
