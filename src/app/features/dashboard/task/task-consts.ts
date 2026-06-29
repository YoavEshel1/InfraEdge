import { TaskStatusVisuals } from './models/task-status-visuals.model';
import { TaskPriorityVisuals } from './models/task-priority-visuals.model';

export const TASK_STATUS_VISUALS: TaskStatusVisuals[] = [
  { status: 'todo',        label: 'לעשות',  colorClass: 'status-todo-dot' },
  { status: 'in-progress', label: 'בתהליך', colorClass: 'status-inProcess-dot' },
  { status: 'done',        label: 'הושלם',  colorClass: 'status-done-dot' },
];

export const PRIORITY_FILTERS: TaskPriorityVisuals[] = [
  { value: 'all',    label: 'הכל' },
  { value: 'high',   label: 'גבוהה',   colorClass: 'priority-high-dot',   borderClass: 'priority-high' },
  { value: 'medium', label: 'בינונית', colorClass: 'priority-medium-dot', borderClass: 'priority-medium' },
  { value: 'low',    label: 'נמוכה',   colorClass: 'priority-low-dot',    borderClass: 'priority-low' },
];
