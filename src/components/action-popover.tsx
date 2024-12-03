import { ActionIcon, Button, Popover, Title, Text, Tooltip } from 'rizzui';
import { FaRegTrashAlt } from 'react-icons/fa';
import { FiRefreshCcw } from 'react-icons/fi';
import { actionIconColorClass, baseButtonClass, buttonColorClass } from '@/config/tailwind-classes';
import cn from '@/utils/class-names';
import { Colors } from '@/models/global.model';

type ActionPopoverProps = {
  label: string; // its action
  title: string; // title to display
  description: string;
  color: Colors;
  handler: () => void;
};

export default function ActionPopover({ label, title, description, color, handler }: ActionPopoverProps) {
  return (
    <Popover placement='right'>
      {/* the btn icon on UI */}
      <Popover.Trigger>
        <ActionIcon
          size='sm'
          variant='outline'
          aria-label={title}
          className={cn(actionIconColorClass[color], 'cursor-pointer')}
        >
          {label === 'Hapus' && <FaRegTrashAlt className='h-4 w-4' />}
          {label === 'Ubah Status' && <FiRefreshCcw className='h-4 w-4' />}
        </ActionIcon>
      </Popover.Trigger>

      {/* the content */}
      <Popover.Content className='z-10'>
        {({ setOpen }) => (
          <div className='w-56 pt-1 pb-2 text-left'>
            <Title as='h6' className='mb-4 flex items-start text-sm text-gray-700 sm:items-center'>
              <FaRegTrashAlt className='me-1 h-[17px] w-[17px]' /> {title}
            </Title>
            <Text className='mb-4 leading-relaxed text-gray-500'>{description}</Text>
            <div className='flex items-center justify-end'>
              <Button
                size='sm'
                className={cn(baseButtonClass, buttonColorClass[color], 'me-1.5 h-7')}
                onClick={handler}
              >
                Iya
              </Button>
              <Button size='sm' variant='outline' className='h-7' onClick={() => setOpen(false)}>
                Tidak
              </Button>
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}
