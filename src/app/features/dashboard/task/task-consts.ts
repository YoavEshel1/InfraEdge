import { Column } from '../board/models/column.model';

export const COLUMNS: Column[] = [
  { status: 'todo',        label: 'לעשות',  colorClass: 'dot-brand' },
  { status: 'in-progress', label: 'בתהליך', colorClass: 'dot-medium' },
  { status: 'done',        label: 'הושלם',  colorClass: 'dot-done' },
];
