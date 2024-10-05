import { OnChangeFn, SortingState } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';

export interface TableAction {
  label: string;
  title: string;
  description: string;
  color: 'red' | 'green' | 'yellow' | 'blue' | 'purple' | 'gray';
  handler: (id: string) => void;
}

export interface BasicTableProps<T> {
  data: T[];
  columns: (actions: TableAction[]) => any[];
  pageSize: number;
  setPageSize: (size: number) => void;
  pageIndex: number;
  setPageIndex: (index: number) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  isLoading: boolean;
  totalRowCount: number;
  actions: TableAction[];
}

export interface FiltersProps<T> {
  localFilters: T;
  setLocalFilters: Dispatch<SetStateAction<T>>;
  handleSearch: () => void;
}

export interface BasicSelectOptionsType {
  value: any;
  label: string;
  disabled?: boolean;
};
