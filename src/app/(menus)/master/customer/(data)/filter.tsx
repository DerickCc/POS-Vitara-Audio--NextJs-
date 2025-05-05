import Card from '@/components/card';
import { useFilterHandlers } from '@/hooks/useFilterHandlers';
import { FiltersProps } from '@/models/global.model';
import { FormEvent } from 'react';
import { PiFunnel } from 'react-icons/pi';
import { Button, Input } from 'rizzui';

export type CustomerTableFilters = {
  name: string;
  licensePlate: string;
  phoneNo: string;
};

export default function CustomerFilter({
  localFilters,
  setLocalFilters,
  handleSearch,
}: FiltersProps<CustomerTableFilters>) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const { handleInputChange } = useFilterHandlers<CustomerTableFilters>(setLocalFilters);

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
          <Input
            value={localFilters.licensePlate}
            name='licensePlate'
            onChange={handleInputChange}
            label='No. Plat'
            placeholder='Cari No. Plat'
          />
          <Input
            type='number'
            name='phoneNo'
            value={localFilters.phoneNo}
            onChange={handleInputChange}
            label='No. Telepon'
            placeholder='Cari No. Telepon'
          />
        </div>

        <Button className='float-right w-20' type='submit'>
          Cari
        </Button>
      </form>
    </Card>
  );
}
