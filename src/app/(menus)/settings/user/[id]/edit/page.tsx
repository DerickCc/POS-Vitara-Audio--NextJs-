'use client';

import UserForm from '@/components/forms/settings/user-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { CreateUpdateUserModel, UpdateUserSchema, UserModel } from '@/models/user.model';
import { apiFetch } from '@/utils/api';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const pageHeader = {
  title: 'Edit User',
  breadcrumb: [
    { name: 'Pengaturan' },
    {
      href: routes.settings.user.data,
      name: 'User',
    },
    {
      name: 'Edit User',
    },
  ],
};

export default function EditUserPage() {
  const router = useRouter();
  const { id } = useParams();
  const [user, setUser] = useState<UserModel>(new UserModel());
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = async (data: CreateUpdateUserModel) => {
    try {
      const response = await apiFetch(`/api/users/${id}`, {
        method: 'PUT',
        body: data,
      });

      toast.success(response.message, { duration: 4000 });
      router.push(routes.settings.user.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  useEffect(() => {
    const getUserById = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch(`/api/users/${id}`, { method: 'GET' });
        setUser(response.result);
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    getUserById();
  }, [id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <UserForm
        defaultValues={new CreateUpdateUserModel(user)}
        schema={UpdateUserSchema}
        isLoading={isLoading}
        onSubmit={updateUser}
      />
    </>
  );
}
