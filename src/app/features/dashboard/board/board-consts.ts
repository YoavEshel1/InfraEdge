import { PriorityFilter } from './models/priority-filter.model';
export const PRIORITY_FILTERS: PriorityFilter[] = [
  { value: 'all',    label: 'הכל' },
  { value: 'high',   label: 'גבוהה',   colorClass: 'dot-brand' },
  { value: 'medium', label: 'בינונית', colorClass: 'dot-medium' },
  { value: 'low',    label: 'נמוכה',   colorClass: 'dot-low' },
];
