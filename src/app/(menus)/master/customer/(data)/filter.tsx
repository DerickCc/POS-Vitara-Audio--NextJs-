import Card from "@/components/card";
import { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";
import { PiFunnel } from "react-icons/pi";
import { Button, Input } from "rizzui";

export type CustomerTableFilters = {
  name: string;
  licensePlate: string;
  phoneNo: string;
};

interface CustomerFiltersProps {
  localFilters: CustomerTableFilters;
  setLocalFilters: Dispatch<SetStateAction<CustomerTableFilters>>;
  handleSearch: () => void;
}

export default function CustomerFilter({ localFilters, setLocalFilters, handleSearch }: CustomerFiltersProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleFilterChange = (field: keyof CustomerTableFilters) => (e: ChangeEvent<HTMLInputElement>) => {
    setLocalFilters((prevFilters) => ({
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
          <Input value={localFilters.name} onChange={handleFilterChange("name")} label="Nama" placeholder="Cari Nama" />
          <Input
            value={localFilters.licensePlate}
            onChange={handleFilterChange("licensePlate")}
            label="No. Plat"
            placeholder="Cari No. Plat"
          />
          <Input
            type="number"
            value={localFilters.phoneNo}
            onChange={handleFilterChange("phoneNo")}
            label="No. Telepon"
            placeholder="Cari No. Telepon"
          />
        </div>

        <Button className="float-right w-20" type="submit">
          Cari
        </Button>
      </form>
    </Card>
  );
}
