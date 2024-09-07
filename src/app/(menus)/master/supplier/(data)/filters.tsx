'use client'

import Card from "@/components/card"
import { SetStateAction } from "jotai"
import { ChangeEvent, ComponentType, Dispatch, FormEvent, useState } from "react"
import { PiFunnel } from "react-icons/pi"
import { Button, Input, NumberInput, Select } from "rizzui"

export type SupplierTableFilters = {
  name: string
  pic: string
  phoneNo: string
  receivablesOperator: ">=" | "<="
  receivables: number
}

const receivablesOperatorOptions = [
  { label: ">=", value: ">=" },
  { label: "<=", value: "<=" },
];

interface SupplierFiltersProps {
  localFilters: SupplierTableFilters
  setLocalFilters: Dispatch<SetStateAction<SupplierTableFilters>>
  handleSearch: () => void
}

export default function SupplierFilter({ localFilters, setLocalFilters, handleSearch }: SupplierFiltersProps) {
  const [receivableOperator, setReceivableOperator] = useState(">=");
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const handleFilterChange = (field: keyof SupplierTableFilters) => (e: ChangeEvent<HTMLInputElement>) => {
    setLocalFilters((prevFilters) => ({
      ...prevFilters,
      [field]: e.target.value,
    }))
  }

  return (
    <Card className="mb-8">
      <h4 className="flex items-center font-medium mb-5">
        <PiFunnel className="me-1.5 h-[18px] w-[18px]" />
        Filter
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="grid sm:grid-cols-3 gap-6 mb-5">
          <Input value={localFilters.name} onChange={handleFilterChange("name")} label="Nama" placeholder="Cari Nama" />
          <Input value={localFilters.pic} onChange={handleFilterChange("pic")} label="PIC" placeholder="Cari PIC" />
          <Input
            value={localFilters.phoneNo}
            onChange={handleFilterChange("phoneNo")}
            label="No. Telepon"
            placeholder="Cari No. Telepon"
          />
          <div>

          </div>
        </div>

        <Button className="float-right w-20" type="submit">
          Cari
        </Button>
      </form>
    </Card>
  )
}
