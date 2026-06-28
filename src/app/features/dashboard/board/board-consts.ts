import { Column } from './models/column.model';
import { PriorityFilter } from './models/priority-filter.model';

export const COLUMNS: Column[] = [
  { status: 'todo',        label: 'לעשות',  colorClass: 'dot-brand' },
  { status: 'in-progress', label: 'בתהליך', colorClass: 'dot-medium' },
  { status: 'done',        label: 'הושלם',  colorClass: 'dot-done' },
];

export const PRIORITY_FILTERS: PriorityFilter[] = [
  { value: 'all',    label: 'הכל' },
  { value: 'high',   label: 'גבוהה',   colorClass: 'dot-brand' },
  { value: 'medium', label: 'בינונית', colorClass: 'dot-medium' },
  { value: 'low',    label: 'נמוכה',   colorClass: 'dot-low' },
];
