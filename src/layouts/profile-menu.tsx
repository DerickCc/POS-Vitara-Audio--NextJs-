'use client';

import { Title, Text, Avatar, Popover } from 'rizzui';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import LogOut from '@/app/(auth)/logout/page';
import { useAuth } from '@/hooks/use-auth';

export default function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <Popover isOpen={isOpen} setIsOpen={setIsOpen} shadow='sm' placement='bottom-end'>
      <Popover.Trigger>
        <button className='w-9 shrink-0 rounded-full outline-none focus-visible:ring-[1.5px] focus-visible:ring-gray-400 focus-visible:ring-offset-2 active:translate-y-px sm:w-10'>
          <Avatar src='/avatar-male.webp' name={user?.name || ''} className='!h-9 w-9 sm:!h-10 sm:!w-10' />
        </button>
      </Popover.Trigger>

      <Popover.Content className='z-[9999] p-0 dark:bg-gray-100 [&>svg]:dark:fill-gray-100'>
        <div className='w-64 text-left rtl:text-right'>
          <div className='flex items-center border-b border-gray-300 px-6 pb-5 pt-6'>
            <Avatar src='/avatar-male.webp' name='Albert Flores' />
            <div className='ms-3'>
              <Title as='h6' className='font-semibold'>
                { user?.name }
              </Title>
              <Text className='text-gray-600'>{user?.username}</Text>
            </div>
          </div>
          <div className='border-t border-gray-300 px-3 pb-3 pt-2'>
            <LogOut />
          </div>
        </div>
      </Popover.Content>
    </Popover>
  );
}
