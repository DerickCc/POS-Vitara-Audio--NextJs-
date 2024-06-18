import { Badge, ActionIcon } from "rizzui";
import ProfileMenu from "@/layouts/profile-menu";
import RingBellSolidIcon from "@/components/icons/ring-bell-solid";
import ChatSolidIcon from "@/components/icons/chat-solid";

export default function HeaderMenuRight() {
  return (
    <div className="ms-auto grid shrink-0 grid-cols-3 items-center gap-2 text-gray-700 xs:gap-3 xl:gap-4">
      <ProfileMenu />
    </div>
  );
}
