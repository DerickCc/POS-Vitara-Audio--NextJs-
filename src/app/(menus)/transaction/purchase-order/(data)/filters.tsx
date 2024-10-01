'use client';

import Card from '@/components/card';
import { poStatusOptions } from '@/config/global-variables';
import { FiltersProps } from '@/models/global.model';
import { FormEvent } from 'react';
import { PiFunnel } from 'react-icons/pi';
import { Button, Input, Select } from 'rizzui';

export type PurchaseOrderFilters = {
  poCode: string;
  supplierId: string | null;
  startDate: string;
  endDate: string;
  status: string;
};

export default function PurchaseOrderFilter({
  localFilters,
  setLocalFilters,
  handleSearch,
}: FiltersProps<PurchaseOrderFilters>) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleFilterChange = (field: keyof PurchaseOrderFilters) => (value: string | number) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  return (
    <Card className="mb-8">
      <h4 className="flex items-center font-medium mb-5">
        <PiFunnel className="me-1.5 h-[18px] w-[18px]" />
        Filter
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-4 gap-6 mb-5">
          <Input
            value={localFilters.poCode}
            onChange={(e) => handleFilterChange('poCode')(e.target.value)}
            label="Kode"
            placeholder="Cari Kode Transaksi"
          />
          <Select
            value={localFilters.supplierId}
            onChange={(value: string) => handleFilterChange('supplierId')(value)}
            label="Supplier"
            placeholder="Pilih Supplier"
            options={[]}
            // options={filterOperatorOptions}
            // displayValue={(value) => filterOperatorOptions.find((option) => option.value === value)?.label ?? ''}
            // getOptionValue={(option) => option.value}
            clearable={true}
            onClear={() => handleFilterChange('supplierId')(0)}
          />
          <Select
            value={localFilters.status}
            onChange={(value: string) => handleFilterChange('status')(value)}
            label="Status"
            placeholder="Pilih Status"
            options={poStatusOptions}
            displayValue={(value) => poStatusOptions.find((option) => option.value === value)?.label ?? ''}
            getOptionValue={(option) => option.value}
            clearable={true}
            onClear={() => handleFilterChange('status')('')}
          />
        </div>

        <Button className="float-right w-20" type="submit">
          Cari
        </Button>
      </form>
    </Card>
  );
}
