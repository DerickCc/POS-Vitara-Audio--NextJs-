'use client';

import { Modal } from "rizzui";
import SearchBar from "./search-bar";
import { useState } from "react";

export default function SearchWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <SearchBar />

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
      ></Modal>
    </>
  )
}