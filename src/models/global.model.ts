import { OnChangeFn, SortingState } from '@tanstack/react-table';
import { Dispatch, SetStateAction } from 'react';
import { ModalSize } from 'rizzui';

export type Colors = 'red' | 'green' | 'yellow' | 'blue' | 'purple' | 'gray';

export interface TableAction {
  label: string;
  title: string;
  description: string;
  color: Colors;
  handler: (id: string) => void;
}

export interface ModalProps {
  isOpen: boolean;
  size?: ModalSize;
  id: string;
  title: string;
  description: string;
  setModalState: (state: boolean) => void;
  handleConfirm: (id: string) => void;
}

export interface TableColumnProps {
  actions: TableAction[];
}

export interface TableColumnWithModalProps extends TableColumnProps {
  modalState: boolean;
  setModalState: (state: boolean) => void;
}

export interface BasicTableProps<T> {
  data: T[];
  // columns: (actions: TableAction[]) => any[];
  columns: (modalState: boolean, setModalState: (state: boolean) => void, actions: TableAction[]) => any[];
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

export interface BasicSelectOptions {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface BasicFormProps<T> {
  defaultValues?: T;
  isLoading?: boolean;
  onSubmit: (data: T) => Promise<void>;
}

export interface PagingModel {
  pageSize: number;
  pageIndex: number;
  sortColumn: string | null;
  sortOrder: string | null;
  filters: object;
}

export interface PaginatedApiResponse<T> {
  message: string;
  result: T[];
  recordsTotal: number;
}
