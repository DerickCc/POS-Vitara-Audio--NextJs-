'use client';

import Card from '@/components/card';
import { paymentStatusOptions, soSrStatusOptions } from '@/config/global-variables';
import { FiltersProps } from '@/models/global.model';
import { FormEvent, useCallback, useState } from 'react';
import { PiCalendarBlank, PiFunnel } from 'react-icons/pi';
import { Button, Input, Select } from 'rizzui';
import ReactDatePicker from 'react-datepicker';
import { datepickerClass } from '@/config/tailwind-classes';
import 'react-datepicker/dist/react-datepicker.css';
import cn from '@/utils/class-names';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';
import { searchCustomer } from '@/services/customer-service';
import { SearchCustomerModel } from '@/models/customer.model';
import { useFilterHandlers } from '@/hooks/useFilterHandlers';

export type SalesOrderFilters = {
  code?: string | undefined;
  customerId?: string | undefined;
  startDate?: any;
  endDate?: any;
  progressStatus?: 'Belum Dikerjakan' | 'Selesai' | 'Batal' | undefined;
  paymentStatus?: 'Belum Lunas' | 'Lunas' | 'Batal' | undefined;
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

  const { handleInputChange, handleSelectChange, handleSelectClear } =
    useFilterHandlers<SalesOrderFilters>(setLocalFilters);

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
            name='code'
            onChange={handleInputChange}
            className='sm:col-span-3'
            label='Kode'
            placeholder='Cari Kode'
          />
          <Select<SearchCustomerModel>
            value={localFilters.customerId}
            name='customerId'
            onChange={(option: SearchCustomerModel) => {
              handleSelectChange('customerId')(option.id);
              setSelectedCustomer(`${option.name} (${option.licensePlate})`);
            }}
            className='sm:col-span-3'
            label='Pelanggan'
            placeholder='Pilih Pelanggan'
            options={customerList}
            displayValue={() => selectedCustomer}
            getOptionValue={(option: SearchCustomerModel) => option}
            getOptionDisplayValue={(option) => `${option.name} (${option.licensePlate})`}
            searchable={true}
            onSearchChange={(search: string) => handleCustomerSearchChange(search)}
            disableDefaultFilter={true}
            clearable={true}
            onClear={handleSelectClear('customerId')}
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
                if (!localFilters.endDate) handleSelectClear('startDate')();
              }}
              onChange={(value: [Date | null, Date | null]) => {
                handleSelectChange('startDate')(value[0]);
                handleSelectChange('endDate')(value[1]);
              }}
              isClearable={true}
              placeholderText='Pilih Tanggal'
              calendarClassName={cn(datepickerClass, 'w-full')}
              clearButtonClassName='mt-3 mr-2'
            />
          </div>
          <Select
            value={localFilters.progressStatus}
            name='progressStatus'
            onChange={handleSelectChange('progressStatus')}
            className='sm:col-span-3'
            label='Status Pengerjaan'
            placeholder='Pilih Status Pengerjaan'
            options={soSrStatusOptions}
            displayValue={(value) => soSrStatusOptions.find((option) => option.value === value)?.label ?? ''}
            getOptionValue={(option) => option.value}
            clearable={true}
            onClear={handleSelectClear('progressStatus')}
          />
          <Select
            value={localFilters.paymentStatus}
            name='paymentStatus'
            onChange={handleSelectChange('paymentStatus')}
            className='sm:col-span-3'
            label='Status Pembayaran'
            placeholder='Pilih Status Pembayaran'
            options={paymentStatusOptions}
            displayValue={(value) => paymentStatusOptions.find((option) => option.value === value)?.label ?? ''}
            getOptionValue={(option) => option.value}
            clearable={true}
            onClear={handleSelectClear('paymentStatus')}
          />
          <div className='sm:col-span-4 flex justify-end items-end'>
            <Button className='w-20' type='submit'>
              Cari
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
