'use client';

import Card from '@/components/card';
import RupiahInput from '@/components/inputs/rupiah-input';
import { FormEvent } from 'react';
import { PiFunnel } from 'react-icons/pi';
import { Button, Input, Select } from 'rizzui';
import { filterOperatorOptions } from '@/config/global-variables';
import { FiltersProps } from '@/models/global.model';
import { useFilterHandlers } from '@/hooks/useFilterHandlers';

export type SupplierTableFilters = {
  name: string;
  pic: string;
  phoneNo: string;
  receivablesOperator: 'gte' | 'lte'; // greater than or equal | less than or equal
  receivables: number;
};

export default function SupplierFilter({
  localFilters,
  setLocalFilters,
  handleSearch,
}: FiltersProps<SupplierTableFilters>) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const { handleInputChange, handleSelectChange } = useFilterHandlers<SupplierTableFilters>(setLocalFilters);

  return (
    <Card className='mb-8'>
      <h4 className='flex items-center font-medium mb-5'>
        <PiFunnel className='me-1.5 h-[18px] w-[18px]' />
        Filter
      </h4>

      <form onSubmit={handleSubmit}>
        <div className='grid sm:grid-cols-3 gap-6 mb-5'>
          <Input
            value={localFilters.name}
            name='name'
            onChange={handleInputChange}
            label='Nama'
            placeholder='Cari Nama'
          />
          <Input value={localFilters.pic} name='pic' onChange={handleInputChange} label='PIC' placeholder='Cari PIC' />
          <Input
            type='number'
            value={localFilters.phoneNo}
            name='phoneNo'
            onChange={handleInputChange}
            label='No. Telepon'
            placeholder='Cari No. Telepon'
          />

          <div className='grid sm:grid-cols-1'>
            <label className='block text-sm font-medium mb-2'>Piutang</label>
            <div className='flex'>
              <Select
                value={localFilters.receivablesOperator}
                name='receivablesOperator'
                onChange={handleSelectChange('receivablesOperator')}
                className='w-24'
                options={filterOperatorOptions}
                displayValue={(value) => filterOperatorOptions.find((option) => option.value === value)?.label ?? ''}
                getOptionValue={(option) => option.value}
              />
              <RupiahInput
                defaultValue={localFilters.receivables}
                onChange={handleSelectChange('receivables')}
                className='w-full ps-3'
              />
            </div>
          </div>
        </div>

        <Button className='float-right w-20' type='submit'>
          Cari
        </Button>
      </form>
    </Card>
  );
}
