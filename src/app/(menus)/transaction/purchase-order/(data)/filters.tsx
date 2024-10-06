'use client';

import Card from '@/components/card';
import { poStatusOptions } from '@/config/global-variables';
import { FiltersProps } from '@/models/global.model';
import { FormEvent } from 'react';
import { PiCalendarBlank, PiFunnel } from 'react-icons/pi';
import { Button, Input, Select } from 'rizzui';
import ReactDatePicker from 'react-datepicker';
import { datepickerClass } from '@/utils/tailwind-classes';
import 'react-datepicker/dist/react-datepicker.css';
import cn from '@/utils/class-names';
import { id } from 'date-fns/locale';
import { SearchSupplierModel } from '@/models/supplier.model';

export type PurchaseOrderFilters = {
  poCode: string;
  supplierId: string | null;
  startDate: any;
  endDate: any;
  status: string;
};

interface PurchaseOrderFiltersProps extends FiltersProps<PurchaseOrderFilters> {
  supplierList: any[];
}

export default function PurchaseOrderFilter({
  supplierList,
  localFilters,
  setLocalFilters,
  handleSearch,
}: PurchaseOrderFiltersProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleFilterChange = (field: keyof PurchaseOrderFilters) => (value: string | number | Date | null) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  return (
    <Card className='mb-8'>
      <h4 className='flex items-center font-medium mb-5'>
        <PiFunnel className='me-1.5 h-[18px] w-[18px]' />
        Filter
      </h4>

      <form onSubmit={handleSubmit}>
        <div className='grid sm:grid-cols-10 gap-6 mb-5'>
          <Input
            value={localFilters.poCode}
            onChange={(e) => handleFilterChange('poCode')(e.target.value)}
            className='sm:col-span-3'
            label='Kode'
            placeholder='Cari Kode Transaksi'
          />
          <Select<SearchSupplierModel>
            value={localFilters.supplierId}
            onChange={(id: string) => handleFilterChange('supplierId')(id)}
            className='sm:col-span-3'
            label='Supplier'
            placeholder='Pilih Supplier'
            options={supplierList}
            displayValue={(id: string) => supplierList.find((option) => option.id === id)?.name ?? ''}
            getOptionValue={(option) => option.id}
            clearable={true}
            onClear={() => handleFilterChange('supplierId')(null)}
          />
          <div className='sm:col-span-4 flex [&_.react-datepicker-wrapper]:flex [&_.react-datepicker-wrapper]:w-full'>
            <ReactDatePicker
              customInput={
                <Input
                  prefix={<PiCalendarBlank className='h-5 w-5 text-gray-500' />}
                  label='Tanggal'
                  labelClassName='font-medium text-gray-700'
                  inputClassName='[&_input]:text-ellipsis'
                />
              }
              locale={id}
              dateFormat='d MMMM yyyy'
              selectsRange={true}
              startDate={localFilters.startDate}
              endDate={localFilters.endDate}
              onChange={(value: [Date | null, Date | null]) => {
                handleFilterChange('startDate')(value[0]);
                handleFilterChange('endDate')(value[1]);
              }}
              isClearable={true}
              placeholderText='Pilih Tanggal'
              calendarClassName={cn(datepickerClass, 'w-full')}
              clearButtonClassName='mt-3 mr-2'
            />
          </div>
          <Select
            value={localFilters.status}
            onChange={(value: string) => handleFilterChange('status')(value)}
            className='sm:col-span-3'
            label='Status'
            placeholder='Pilih Status'
            options={poStatusOptions}
            displayValue={(value) => poStatusOptions.find((option) => option.value === value)?.label ?? ''}
            getOptionValue={(option) => option.value}
            clearable={true}
            onClear={() => handleFilterChange('status')('')}
          />
          <div className='sm:col-span-7 flex justify-end items-end'>
            <Button className='w-20' type='submit'>
              Cari
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
