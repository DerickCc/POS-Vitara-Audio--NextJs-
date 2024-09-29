'use client';

import UserForm from '@/components/forms/settings/user-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { CreateUpdateUserModel, CreateUserSchema } from '@/models/user.model';
import { apiFetch } from '@/utils/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

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

  const createUser = async (data: CreateUpdateUserModel) => {
    try {
      const response = await apiFetch('/api/users', {
        method: 'POST',
        body: data,
      });

      toast.success(response.message, { duration: 4000 });
      router.push(routes.settings.user.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <UserForm schema={CreateUserSchema} onSubmit={createUser} />
    </>
  );
}
