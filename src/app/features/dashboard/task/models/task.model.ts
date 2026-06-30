export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export interface Task {
//json-server v1 (which i have: 1.0.0-beta.15) switched from auto-incrementing integers to random
//this is a workaround to allow both number and string ids, since the backend may return either type
  id: number | string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  userId: number | string;
  description?: string;
}

export type CreateTaskDto = Omit<Task, 'id'>;
