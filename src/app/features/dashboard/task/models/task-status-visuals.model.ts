import { TaskStatus } from './task.model';

export interface TaskStatusVisuals {
  status: TaskStatus;
  label: string;
  colorClass: string;
}
