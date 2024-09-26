import { ColumnDef, OnChangeFn, SortingState } from "@tanstack/react-table";

export interface BasicTableProps<T> {
  data: T[];
  columns: (handleDelete: (id: string) => void) => any[];
  pageSize: number;
  setPageSize: (size: number) => void;
  pageIndex: number;
  setPageIndex: (index: number) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  isLoading: boolean;
  totalRowCount: number;
  onDelete?: (id: string) => void;
}