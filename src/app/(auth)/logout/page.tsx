"use client";

import { destroySession } from "@/utils/sessionlib";
import { useRouter } from "next/navigation";
import { Button } from "rizzui";

export default function LogOut() {
  const router = useRouter();

  function logoutAndRedirect() {
    destroySession();
    router.push("/login");
  }

  return (
    <Button
      className="h-auto w-full justify-start font-medium text-gray-700 outline-none hover:text-gray-900 hover:bg-gray-200"
      variant="text"
      onClick={() => logoutAndRedirect()}
    >
      Log Out
    </Button>
  );
}
