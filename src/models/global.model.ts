import { ColumnDef, OnChangeFn, SortingState } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';

export type Colors = 'red' | 'green' | 'yellow' | 'blue' | 'purple' | 'gray';
export type PoPrSrStatusType = 'Dalam Proses' | 'Selesai' | 'Batal';
export type SoStatusType = 'Belum Lunas' | 'Lunas' | 'Batal';

export interface TableAction {
  label: string;
  title: string;
  description: string;
  additionalText?: string;
  color: Colors;
  handler: (id: string) => void;
}

export interface BasicTableProps<T> {
  header?: React.ReactNode;
  data: T[];
  columns: ColumnDef<T>[];
  pageSize: number;
  setPageSize: (size: number) => void;
  pageIndex: number;
  setPageIndex: (index: number) => void;
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  isLoading: boolean;
  totalRowCount: number;
  showPageInfo?: boolean;
}

export interface FiltersProps<T> {
  localFilters: T;
  setLocalFilters: Dispatch<SetStateAction<T>>;
  handleSearch: () => void;
}

export interface BasicSelectOptions {
  value: any;
  label: any;
  disabled?: boolean;
}

export interface BasicFormProps<T> {
  defaultValues?: T;
  isLoading?: boolean;
  onSubmit: (data: T) => Promise<void>;
}

export interface QueryParamsModel {
  pageSize?: number;
  pageIndex?: number;
  sortColumn?: string | null;
  sortOrder?: string | null;
  filters?: object
}

export interface PaginatedApiResponse<T> {
  message: string;
  result: T[];
  recordsTotal: number;
}
