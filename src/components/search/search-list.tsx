"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import {
  PiFileTextDuotone,
  PiMagnifyingGlassBold,
  PiXBold,
} from "react-icons/pi";
import {
  ActionIcon,
  Button,
  Empty,
  Input,
  SearchNotFoundIcon,
  Title,
} from "rizzui";
import { pageLinks } from "./page-links.data";
import Link from "next/link";

export default function SearchList({ onClose }: { onClose?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchText, setSearchText] = useState("");

  let menuItemsFiltered = pageLinks;
  if (searchText.length > 0) {
    const searchTextLower = searchText.toLowerCase();

    menuItemsFiltered = pageLinks.filter((item: any) => {
      const label = item.name.toLowerCase();
      return label.includes(searchTextLower);
    });
  }

  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  }, []); // only triggered once, which is on init

  return (
    <>
      {/* Search input and close icon */}
      <div className="flex items-center px-5 py-4">
        <Input
          variant="flat"
          value={searchText}
          ref={inputRef}
          onChange={(e) => setSearchText(() => e.target.value)}
          placeholder="Cari menu disini"
          className="flex-1"
          prefix={
            <PiMagnifyingGlassBold className="h-[20px] w-[20px] text-gray-600" />
          }
          suffix={
            searchText && (
              <Button
                size="sm"
                variant="text"
                className="h-auto w-auto px-0"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchText("");
                }}
              >
                Clear
              </Button>
            )
          }
        />
        <ActionIcon
          variant="text"
          size="sm"
          className="ms-3 text-gray-500 hover:text-primary-dark"
          onClick={onClose}
        >
          <PiXBold className="h-5 w-5"></PiXBold>
        </ActionIcon>
      </div>

      {/* Menu list */}
      <div className="custom-scrollbar max-h-[60vh] overflow-y-auto border-t border-gray-300 px-2 py-4">
        {menuItemsFiltered.length === 0 ? (
          <Empty
            className="scale-75"
            image={<SearchNotFoundIcon />}
            text="Menu Tidak Ditemukan"
            textClassName="text-xl"
          />
        ) : null}

        {menuItemsFiltered.map((item, idx) => {
          return (
            <Fragment key={item.name + "-" + idx}>
              {item?.href ? (
                <Link
                  href={item.href}
                  onClick={() =>
                    setTimeout(() => {
                      onClose;
                    }, 100)
                  }
                  className="my-0.5 flex items-center px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <span className="inline-flex items-center justify-content-center rounded-md border border-gray-300 p-2 text-gray-500">
                    <PiFileTextDuotone className="h-5 w-5" />
                  </span>

                  <span className="ms-3 grid gap-0.5">
                    <span className="font-medium text-gray-900">
                      {item.name}
                    </span>
                    <span className="text-gray-500">{item.href}</span>
                  </span>
                </Link>
              ) : (
                <Title
                  as="h6"
                  className="mb-1 px-3 text-xs font-semibold uppercase tracking-widest text-gray-500"
                >
                  {item.name}
                </Title>
              )}
            </Fragment>
          );
        })}
      </div>
    </>
  );
}
