import React from 'react';

export function useFilterHandlers<T>(setFilters: React.Dispatch<React.SetStateAction<T>>) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSelectChange = (field: keyof T) => (value: string | number | Date | null) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const handleSelectClear = (field: keyof T) => () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: '',
    }));
  };

  return { handleInputChange, handleSelectChange, handleSelectClear };
}
