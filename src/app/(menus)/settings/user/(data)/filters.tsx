import Card from '@/components/card';
import { accountStatusOptions, roleOptions } from '@/config/global-variables';
import { useFilterHandlers } from '@/hooks/useFilterHandlers';
import { FiltersProps, BasicSelectOptions } from '@/models/global.model';
import { FormEvent } from 'react';
import { PiFunnel } from 'react-icons/pi';
import { Button, Input, Select } from 'rizzui';

export type UserTableFilters = {
  name: string;
  accountStatus: string;
  role: 'Admin' | 'Kasir' | '';
};

export default function UserFilter({ localFilters, setLocalFilters, handleSearch }: FiltersProps<UserTableFilters>) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const { handleInputChange, handleSelectChange, handleSelectClear } =
    useFilterHandlers<UserTableFilters>(setLocalFilters);

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
          <Select<BasicSelectOptions>
            value={localFilters.accountStatus}
            onChange={handleSelectChange('accountStatus')}
            label='Status Akun'
            placeholder='Pilih Status Akun'
            options={accountStatusOptions}
            displayValue={(value) => accountStatusOptions.find((option) => option.value === value)?.label ?? ''}
            getOptionValue={(option) => option.value}
            clearable={true}
            onClear={handleSelectClear('accountStatus')}
          />
          <Select<BasicSelectOptions>
            value={localFilters.role}
            onChange={handleSelectChange('role')}
            label='Role'
            placeholder='Pilih Role'
            options={roleOptions}
            displayValue={(value) => roleOptions.find((option) => option.value === value)?.label ?? ''}
            getOptionValue={(option) => option.value}
            clearable={true}
            onClear={handleSelectClear('role')}
          />
        </div>

        <Button className='float-right w-20' type='submit'>
          Cari
        </Button>
      </form>
    </Card>
  );
}
