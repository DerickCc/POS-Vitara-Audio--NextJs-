"use client";

import { Modal } from "rizzui";
import SearchBar from "./search-bar";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SearchList from "./search-list";

export default function SearchWidget() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "e") {
        event.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);

    // remove eventListener when component is unmounted or before re-run effect to avoid memory leak
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]); // re-run effect when open's value change

  // close modal when pathname change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <SearchBar openModal={() => setOpen(true)} />

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        overlayClassName="dark:bg-opacity-50 dark:backdrop-blur-sm"
        className="z-[9999]"
      >
        <SearchList closeModal={() => setOpen(false)} />
      </Modal>
    </>
  );
}
