import { Priority } from '../../task/models/task.model';

export interface PriorityFilter {
  value: Priority | 'all';
  label: string;
  colorClass?: string;
}
