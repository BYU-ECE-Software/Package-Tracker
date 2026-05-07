// Shape AdminDropdownPanel expects from any entity it edits: a stable id, a
// human name, a soft-hide flag, and a numeric sort order. Any model that
// exposes these fields can be plugged into AdminDropdownPanel.

export interface DropdownEntity {
  id: string;
  name: string;
  hidden: boolean;
  sortOrder: number;
}
