'use client';

import UserForm from '@/components/forms/settings/user-form';
import PageHeader from '@/components/page-header';
import { routes } from '@/config/routes';
import { CreateUpdateUserModel, UpdateUserSchema, UserModel } from '@/models/user.model';
import { getUserById, updateUser } from '@/services/user-service';
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
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserModel>(new UserModel());
  const [isLoading, setIsLoading] = useState(true);

  const update = async (payload: CreateUpdateUserModel) => {
    try {
      const message = await updateUser(id, payload);
      toast.success(message, { duration: 4000 });

      router.push(routes.settings.user.data);
    } catch (e) {
      toast.error(e + '', { duration: 5000 });
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        setUser(await getUserById(id));
      } catch (e) {
        toast.error(e + '', { duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return (
    <>
      <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}></PageHeader>

      <UserForm
        defaultValues={new CreateUpdateUserModel(user)}
        schema={UpdateUserSchema}
        isLoading={isLoading}
        onSubmit={update}
      />
    </>
  );
}
