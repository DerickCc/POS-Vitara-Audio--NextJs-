import { OnChangeFn, SortingState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";

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

export interface FiltersProps<T> {
  localFilters: T;
  setLocalFilters: Dispatch<SetStateAction<T>>;
  handleSearch: () => void;
}