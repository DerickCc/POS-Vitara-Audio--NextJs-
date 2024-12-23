'use client';

import UserForm from '@/components/user/user-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { CreateUpdateUserModel, CreateUserSchema } from '@/models/user.model';
import { createUser } from '@/services/user-service';
import { apiFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Button } from 'rizzui';
import { PiArrowLeftBold } from 'react-icons/pi';

const pageHeader = {
  title: 'Tambah User',
  breadcrumb: [
    {
      name: 'Pengaturan',
    },
    {
      href: routes.settings.user.data,
      name: 'User',
    },
    {
      name: 'Tambah User',
    },
  ],
};

export default function AddUserPage() {
  const router = useRouter();

  const create = async (payload: CreateUpdateUserModel) => {
    try {
      const message = await createUser(payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.settings.user.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader {...pageHeader}></PageHeader>

      <div className='grid gap-6'>
        <Link href={routes.settings.user.data}>
          <Button variant='outline' className='border-2 border-gray-200'>
            <PiArrowLeftBold className='size-4 me-1.5'></PiArrowLeftBold>
            <span>Kembali</span>
          </Button>
        </Link>
        
        <UserForm schema={CreateUserSchema} onSubmit={create} />
      </div>
    </>
  );
}
