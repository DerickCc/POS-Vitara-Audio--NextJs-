'use client';

import Card from '@/components/card';
import { poStatusOptions } from '@/config/global-variables';
import { FiltersProps } from '@/models/global.model';
import { FormEvent, useState } from 'react';
import { PiCalendarBlank, PiFunnel } from 'react-icons/pi';
import { Button, Input, Select } from 'rizzui';
import ReactDatePicker from 'react-datepicker';
import { datepickerClass } from '@/utils/tailwind-classes';
import 'react-datepicker/dist/react-datepicker.css';
import cn from '@/utils/class-names';

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

  const [dateRange, setDateRange] = useState([undefined, undefined]);
  const [startDate, endDate] = dateRange;

  return (
    <Card className="mb-8">
      <h4 className="flex items-center font-medium mb-5">
        <PiFunnel className="me-1.5 h-[18px] w-[18px]" />
        Filter
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-10 gap-6 mb-5">
          <Input
            value={localFilters.poCode}
            onChange={(e) => handleFilterChange('poCode')(e.target.value)}
            className="sm:col-span-3"
            label="Kode"
            placeholder="Cari Kode Transaksi"
          />
          <Select
            value={localFilters.supplierId}
            onChange={(value: string) => handleFilterChange('supplierId')(value)}
            className="sm:col-span-3"
            label="Supplier"
            placeholder="Pilih Supplier"
            options={[]}
            // options={filterOperatorOptions}
            // displayValue={(value) => filterOperatorOptions.find((option) => option.value === value)?.label ?? ''}
            // getOptionValue={(option) => option.value}
            clearable={true}
            onClear={() => handleFilterChange('supplierId')(0)}
          />
          <div className="sm:col-span-4 flex [&_.react-datepicker-wrapper]:flex [&_.react-datepicker-wrapper]:w-full">
            <ReactDatePicker
              customInput={
                <Input
                  prefix={<PiCalendarBlank className="h-5 w-5 text-gray-500" />}
                  label="Tanggal"
                  labelClassName="font-medium text-gray-700"
                  inputClassName="[&_input]:text-ellipsis"
                />
              }
              dateFormat="d MMMM yyyy"
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setDateRange(update);
              }}
              isClearable={true}
              placeholderText="Pilih Tanggal"
              calendarClassName={cn(datepickerClass, 'w-full')}
              clearButtonClassName="mt-3 mr-2"
            />
          </div>
          <Select
            value={localFilters.status}
            onChange={(value: string) => handleFilterChange('status')(value)}
            className="sm:col-span-3"
            label="Status"
            placeholder="Pilih Status"
            options={poStatusOptions}
            displayValue={(value) => poStatusOptions.find((option) => option.value === value)?.label ?? ''}
            getOptionValue={(option) => option.value}
            clearable={true}
            onClear={() => handleFilterChange('status')('')}
          />
          <div className="sm:col-span-7 flex justify-end items-end">
            <Button className="w-20" type="submit">
              Cari
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
