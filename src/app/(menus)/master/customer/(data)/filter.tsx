import Card from "@/components/ui/card";
import { Dispatch, FormEvent, SetStateAction } from "react";
import { PiFunnel } from "react-icons/pi";
import { Button, Input } from "rizzui";

export type CustomerTableFilters = {
  name: string;
  licensePlate: string;
  phoneNo: string;
};

interface CustomerFiltersProps {
  filters: CustomerTableFilters;
  setFilters: Dispatch<SetStateAction<CustomerTableFilters>>;
  handleSearch: () => void;
}

export default function CustomerFilter({
  filters,
  setFilters,
  handleSearch,
}: CustomerFiltersProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    handleSearch();
  }

  const handleFilterChange =
    (field: keyof CustomerTableFilters) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prevFilters) => ({
        ...prevFilters,
        [field]: e.target.value,
      }));
    };

  return (
    <Card className="mb-8">
      <h4 className="flex items-center font-medium mb-5">
        <PiFunnel className="me-1.5 h-[18px] w-[18px]" />
        Filter
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-3 gap-6 mb-5">
          <Input
            value={filters.name}
            onChange={handleFilterChange("name")}
            label="Nama"
            placeholder="Cari Nama"
          />
          <Input
            value={filters.licensePlate}
            onChange={handleFilterChange("licensePlate")}
            label="No. Plat"
            placeholder="Cari No. Plat"
          />
          <Input
            value={filters.phoneNo}
            onChange={handleFilterChange("phoneNo")}
            label="No. Telepon"
            placeholder="Cari No. Telepon"
          />
        </div>

        <Button
          className="float-right w-20"
          onClick={handleSearch}
          type="submit"
        >
          Cari
        </Button>
      </form>
    </Card>
  );
}
