import { TaskStatus } from '../../task/models/task.model';

export interface Column {
  status: TaskStatus;
  label: string;
  colorClass: string;
}
