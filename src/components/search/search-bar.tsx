import { PiMagnifyingGlassBold } from "react-icons/pi";

export default function SearchBar({ openModal }: { openModal?: () => void }) {
  return (
    <button
      aria-label="Search"
      className="
        group inline-flex items-center focus:outline-none active:translate-y-px w-full max-w-sm rounded-lg md:border md:border-muted 
        md:hover:border-primary-dark md:hover:outline-double md:hover:outline-[0.5px]
        transition-colors duration-200 py-2 px-2 shadow-sm backdrop-blur-md
      "
      onClick={openModal}
    >
      <PiMagnifyingGlassBold className="mx-1.5 h-[20px] w-[20px]" />
      <span className="hidden text-sm text-gray-600 group-hover:text-primary-dark md:inline-flex">
        Cari menu
      </span>
      <span className="hidden bg-primary font-semibold text-sm lg:text-xs rounded-md text-primary-foreground items-center justify-center md:flex ms-auto px-1.5 py-1">
        Ctrl + E
      </span>
    </button>
  );
}
