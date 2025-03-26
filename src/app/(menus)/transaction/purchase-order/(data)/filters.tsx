'use client';

import Card from '@/components/card';
import { paymentStatusOptions, poPrStatusOptions } from '@/config/global-variables';
import { FiltersProps } from '@/models/global.model';
import { FormEvent, useCallback, useState } from 'react';
import { PiCalendarBlank, PiFunnel } from 'react-icons/pi';
import { Button, Input, Select } from 'rizzui';
import ReactDatePicker from 'react-datepicker';
import { datepickerClass } from '@/config/tailwind-classes';
import 'react-datepicker/dist/react-datepicker.css';
import cn from '@/utils/class-names';
import { id } from 'date-fns/locale';
import { SearchSupplierModel } from '@/models/supplier.model';
import { searchSupplier } from '@/services/supplier-service';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

export type PurchaseOrderTableFilters = {
  code?: string | undefined;
  supplierId?: string | undefined;
  startDate?: any;
  endDate?: any;
  progressStatus?: 'Dalam Proses' | 'Selesai' | 'Batal' | undefined;
  paymentStatus?: 'Belum Lunas' | 'Lunas' | 'Batal' | undefined;
};

export default function PurchaseOrderFilter({
  localFilters,
  setLocalFilters,
  handleSearch,
}: FiltersProps<PurchaseOrderTableFilters>) {
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

  const handleFilterChange = (field: keyof PurchaseOrderTableFilters) => (value: string | number | Date | null) => {
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
            label='Kode'
            placeholder='Cari Kode'
          />
          <Select<SearchSupplierModel>
            value={localFilters.supplierId}
            onChange={(option: SearchSupplierModel) => {
              handleFilterChange('supplierId')(option.id);
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
            onClear={() => handleFilterChange('supplierId')(null)}
            searchProps={{autoFocus: true}}
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
                if (!localFilters.endDate) handleFilterChange('startDate')(null);
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
            value={localFilters.progressStatus}
            onChange={(value: string) => handleFilterChange('progressStatus')(value)}
            className='sm:col-span-3'
            label='Status Pengiriman'
            placeholder='Pilih Status Pengiriman'
            options={poPrStatusOptions}
            displayValue={(value) => poPrStatusOptions.find((option) => option.value === value)?.label ?? ''}
            getOptionValue={(option) => option.value}
            clearable={true}
            onClear={() => handleFilterChange('progressStatus')('')}
          />
          <Select
            value={localFilters.paymentStatus}
            onChange={(value: string) => handleFilterChange('paymentStatus')(value)}
            className='sm:col-span-3'
            label='Status Pembayaran'
            placeholder='Pilih Status Pembayaran'
            options={paymentStatusOptions}
            displayValue={(value) => paymentStatusOptions.find((option) => option.value === value)?.label ?? ''}
            getOptionValue={(option) => option.value}
            clearable={true}
            onClear={() => handleFilterChange('paymentStatus')('')}
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
