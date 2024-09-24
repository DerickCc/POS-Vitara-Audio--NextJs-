import Card from "@/components/card";
import DecimalInput from "@/components/inputs/decimal-input";
import { filterOperatorOptions } from "@/config/constants";
import { SetStateAction } from "jotai";
import { Dispatch, FormEvent } from "react";
import { PiFunnel } from "react-icons/pi";
import { Button, Input, Select } from "rizzui";

export type ProductTableFilters = {
  name: string;
  stockOperator: "gte" | "lte";
  stock: number;
  uom: string;
};

interface ProductFiltersProps {
  localFilters: ProductTableFilters;
  setLocalFilters: Dispatch<SetStateAction<ProductTableFilters>>;
  handleSearch: () => void;
}

export default function ProductFilter({ localFilters, setLocalFilters, handleSearch }: ProductFiltersProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleFilterChange = (field: keyof ProductTableFilters) => (value: string | number) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
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
            value={localFilters.name}
            onChange={(e) => handleFilterChange("name")(e.target.value)}
            label="Nama"
            placeholder="Cari Nama"
          />
          <div className="grid sm:grid-cols-1">
            <label className="block text-sm font-medium mb-2">Stok</label>
            <div className="flex">
              <Select
                value={localFilters.stockOperator}
                onChange={(value: string) => handleFilterChange("stockOperator")(value)}
                className="w-24"
                options={filterOperatorOptions}
                displayValue={(value) => filterOperatorOptions.find((option) => option.value === value)?.label || ""}
                getOptionValue={(option) => option.value}
              />
              <DecimalInput
                defaultValue={localFilters.stock}
                onChange={(value) => handleFilterChange("stock")(value)}
                className="w-full ps-3"
              />
            </div>
          </div>
          <Input
            value={localFilters.uom}
            onChange={(e) => handleFilterChange("uom")(e.target.value)}
            label="Satuan"
            placeholder="Cari Satuan"
          />
        </div>

        <Button className="float-right w-20" type="submit">
          Cari
        </Button>
      </form>
    </Card>
  );
}
