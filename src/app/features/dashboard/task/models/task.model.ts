export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  priority: Priority;
  userId: number;
  description?: string;
}

export type CreateTaskDto = Omit<Task, 'id'>;
