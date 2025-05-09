import Card from '@/components/card';
import DecimalInput from '@/components/inputs/decimal-input';
import { filterOperatorOptions } from '@/config/global-variables';
import { useFilterHandlers } from '@/hooks/useFilterHandlers';
import { FiltersProps } from '@/models/global.model';
import { FormEvent } from 'react';
import { PiFunnel } from 'react-icons/pi';
import { Button, Input, Select } from 'rizzui';

export type ProductTableFilters = {
  name: string;
  stockOperator: 'gte' | 'lte';
  stock: number;
  uom: string;
};

export default function ProductFilter({
  localFilters,
  setLocalFilters,
  handleSearch,
}: FiltersProps<ProductTableFilters>) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const { handleInputChange, handleSelectChange } = useFilterHandlers<ProductTableFilters>(setLocalFilters);

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
          <div className='grid sm:grid-cols-1'>
            <label className='block text-sm font-medium mb-2'>Stok</label>
            <div className='flex'>
              <Select
                value={localFilters.stockOperator}
                name='stockOperator'
                onChange={handleSelectChange('stockOperator')}
                className='w-24'
                options={filterOperatorOptions}
                displayValue={(value) => filterOperatorOptions.find((option) => option.value === value)?.label || ''}
                getOptionValue={(option) => option.value}
              />
              <DecimalInput
                defaultValue={localFilters.stock}
                onChange={handleSelectChange('stock')}
                className='w-full ps-3'
              />
            </div>
          </div>
          <Input
            value={localFilters.uom}
            name='uom'
            onChange={handleInputChange}
            label='Satuan'
            placeholder='Cari Satuan'
          />
        </div>

        <Button className='float-right w-20' type='submit'>
          Cari
        </Button>
      </form>
    </Card>
  );
}
