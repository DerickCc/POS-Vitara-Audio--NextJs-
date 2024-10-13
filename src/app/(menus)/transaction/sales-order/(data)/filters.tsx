'use client';

import Card from '@/components/card';
import { soStatusOptions } from '@/config/global-variables';
import { FiltersProps } from '@/models/global.model';
import { FormEvent, useCallback, useState } from 'react';
import { PiCalendarBlank, PiFunnel } from 'react-icons/pi';
import { Button, Input, Select } from 'rizzui';
import ReactDatePicker from 'react-datepicker';
import { datepickerClass } from '@/utils/tailwind-classes';
import 'react-datepicker/dist/react-datepicker.css';
import cn from '@/utils/class-names';
import { id } from 'date-fns/locale';
import { SearchSupplierModel } from '@/models/supplier.model';
import { searchSupplier } from '@/services/supplier-service';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';
import { searchCustomer } from '@/services/customer-service';
import { SearchCustomerModel } from '@/models/customer.model';

export type SalesOrderFilters = {
  code: string;
  customerId: string | null;
  startDate: any;
  endDate: any;
  status: string;
};

export default function SalesOrderFilter({
  localFilters,
  setLocalFilters,
  handleSearch,
}: FiltersProps<SalesOrderFilters>) {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerList, setCustomerList] = useState<SearchCustomerModel[]>([]);

  const handleCustomerSearchChange = useCallback(
    debounce(async (name: string) => {
      if (!name || name.trim() === '') return;

      try {
        setCustomerList(await searchCustomer(name));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      }
    }, 500),
    []
  );

  const handleFilterChange = (field: keyof SalesOrderFilters) => (value: string | number | Date | null) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
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
            value={localFilters.code}
            onChange={(e) => handleFilterChange('code')(e.target.value)}
            className='sm:col-span-3'
            label='No. Invoice'
            placeholder='Cari No. Invoice'
          />
          <Select<SearchCustomerModel>
            value={localFilters.customerId}
            onChange={(option: SearchSupplierModel) => {
              handleFilterChange('customerId')(option.id);
              setSelectedCustomer(option.name);
            }}
            className='sm:col-span-3'
            label='Pelanggan'
            placeholder='Pilih Pelanggan'
            options={customerList}
            displayValue={() => selectedCustomer}
            getOptionValue={(option: SearchCustomerModel) => option}
            searchable={true}
            searchByKey='name'
            onSearchChange={(name: string) => handleCustomerSearchChange(name)}
            disableDefaultFilter={true}
            clearable={true}
            onClear={() => handleFilterChange('customerId')(null)}
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
              onCalendarOpen={() => {
                if (!localFilters.endDate) handleFilterChange('startDate')(null)
              }}
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
            options={soStatusOptions}
            displayValue={(value) => soStatusOptions.find((option) => option.value === value)?.label ?? ''}
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
