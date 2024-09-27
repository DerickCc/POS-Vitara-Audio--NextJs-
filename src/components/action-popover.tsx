import { ActionIcon, Button, Popover, Title, Text } from "rizzui";
import { FaRegTrashAlt } from "react-icons/fa";

type ActionPopoverProps = {
  title: string;
  description: string;
  onAction: () => void;
};

export default function ActionPopover({
  title,
  description,
  onAction,
}: ActionPopoverProps) {
  return (
    <Popover placement="right">
      {/* the btn icon on UI */}
      <Popover.Trigger>
        <ActionIcon
          size="sm"
          variant="outline"
          aria-label={"Delete Item"}
          className="cursor-pointer text-red-500 hover:border-red-600 hover:text-red-600"
        >
          <FaRegTrashAlt className="h-4 w-4" />
        </ActionIcon>
      </Popover.Trigger>

      {/* the content */}
      <Popover.Content className="z-10">
        {({ setOpen }) => (
          <div className="w-56 pt-1 pb-2 text-left">
            <Title
              as="h6"
              className="mb-4 flex items-start text-sm text-gray-700 sm:items-center"
            >
              <FaRegTrashAlt className="me-1 h-[17px] w-[17px]" /> {title}
            </Title>
            <Text className="mb-4 leading-relaxed text-gray-500">
              {description}
            </Text>
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                color="danger"
                className="me-1.5 h-7"
                onClick={onAction}
              >
                Iya
              </Button>
              <Button
                size="sm"
                variant="outline"
                color="danger"
                className="h-7"
                onClick={() => setOpen(false)}
              >
                Tidak
              </Button>
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}
