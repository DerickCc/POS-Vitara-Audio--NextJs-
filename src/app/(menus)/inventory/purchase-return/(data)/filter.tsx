'use client';

import Card from '@/components/card';
import { FiltersProps } from '@/models/global.model';
import { SearchSupplierModel } from '@/models/supplier.model';
import { searchSupplier } from '@/services/supplier-service';
import { debounce } from 'lodash';
import { FormEvent, useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { PiCalendarBlank, PiFunnel } from 'react-icons/pi';
import { Button, Input, Select } from 'rizzui';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { id } from 'date-fns/locale';
import cn from '@/utils/class-names';
import { datepickerClass } from '@/config/tailwind-classes';
import { poPrStatusOptions, prTypeOptions } from '@/config/global-variables';
import { useFilterHandlers } from '@/hooks/useFilterHandlers';

export type PurchaseReturnTableFilters = {
  code?: string;
  supplierId?: string;
  startDate: any;
  endDate: any;
  poCode?: string;
  status?: string;
  returnType?: string;
};

export default function PurchaseReturnFilter({
  localFilters,
  setLocalFilters,
  handleSearch,
}: FiltersProps<PurchaseReturnTableFilters>) {
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [supplierList, setSupplierList] = useState<SearchSupplierModel[]>([]);

  const handleSupplierSearchChange = useCallback(
    debounce(async (name: string) => {
      if (!name || name.trim() === '') return;

      try {
        setSupplierList(await searchSupplier(name));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      }
    }, 500),
    []
  );

  const { handleInputChange, handleSelectChange, handleSelectClear } =
    useFilterHandlers<PurchaseReturnTableFilters>(setLocalFilters);

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
            label='Kode Retur Pembelian'
            placeholder='Cari Kode Retur Pembelian'
          />
          <Select<SearchSupplierModel>
            value={localFilters.supplierId}
            name='supplierId'
            onChange={(option: SearchSupplierModel) => {
              handleSelectChange('supplierId')(option.id);
              setSelectedSupplier(option.name);
            }}
            className='sm:col-span-3'
            label='Supplier'
            placeholder='Pilih Supplier'
            options={supplierList}
            displayValue={() => selectedSupplier}
            getOptionValue={(option: SearchSupplierModel) => option}
            searchable={true}
            searchByKey='name'
            onSearchChange={(name: string) => handleSupplierSearchChange(name)}
            disableDefaultFilter={true}
            clearable={true}
            onClear={handleSelectClear('supplierId')}
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
          <Input
            value={localFilters.poCode}
            name='poCode'
            onChange={handleInputChange}
            className='sm:col-span-3'
            label='Kode Transaksi Pembelian'
            placeholder='Cari Kode Transaksi Pembelian'
          />
          <Select
            value={localFilters.status}
            name='status'
            onChange={handleSelectChange('status')}
            className='sm:col-span-3'
            label='Status'
            placeholder='Pilih Status'
            options={poPrStatusOptions}
            displayValue={(value) => poPrStatusOptions.find((option) => option.value === value)?.label ?? ''}
            getOptionValue={(option) => option.value}
            clearable={true}
            onClear={handleSelectClear('status')}
          />
          <Select
            value={localFilters.returnType}
            name='returnType'
            onChange={handleSelectChange('returnType')}
            className='sm:col-span-3'
            label='Tipe Retur'
            placeholder='Pilih Tipe Retur'
            options={prTypeOptions}
            displayValue={(value) => prTypeOptions.find((option) => option.value === value)?.label ?? ''}
            getOptionValue={(option) => option.value}
            clearable={true}
            onClear={handleSelectClear('returnType')}
          />
          <div className='sm:col-span-1 flex justify-end items-end'>
            <Button className='w-20' type='submit'>
              Cari
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
