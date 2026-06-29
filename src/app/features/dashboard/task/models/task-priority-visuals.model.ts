import { Priority } from './task.model';

export interface TaskPriorityVisuals {
  value: Priority | 'all';
  label: string;
  colorClass?: string;   // dot indicator (background-color)
  borderClass?: string;  // card priority border
}
