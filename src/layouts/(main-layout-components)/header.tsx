'use client';

import Link from 'next/link';
import HamburgerButton from '@/layouts/hamburger-button';
import Sidebar from '@/layouts/(main-layout-components)/sidebar';
import HeaderMenuRight from '@/layouts/header-menu-right';
import StickyHeader from '@/layouts/sticky-header';
import { Title } from 'rizzui';
import SearchWidget from '@/components/search/search-widget';

export default function Header() {
  return (
    <StickyHeader className='z-[990] 2xl:py-5 3xl:px-8  4xl:px-10'>
      <div className='flex w-full max-w-2xl items-center'>
        <HamburgerButton view={<Sidebar className='static w-full 2xl:w-full' />} />
        <Link
          href={'/'}
          aria-label='Site Logo'
          className='me-4 shrink-0 text-gray-800 hover:text-gray-900 lg:me-5 xl:hidden'
        >
          <Title as='h2' className='text-md'>
            Vitara Audio
          </Title>
        </Link>
        <SearchWidget />
      </div>

      <HeaderMenuRight />
    </StickyHeader>
  );
}
