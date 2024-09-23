import { formatToCurrency, parseNumber } from "@/utils/helper-function";
import { useEffect, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { Input } from "rizzui";

type ThousandSeparatorFormInputProps = {
  setValue: UseFormSetValue<any>; // Pass setValue from useForm
  label: string;
  fieldName: string;
  defaultValue: number;
  readOnly?: boolean;
  error?: string;
};

export default function ThousandSeparatorFormInput({
  setValue,
  label,
  fieldName,
  defaultValue,
  readOnly = false,
  error,
}: ThousandSeparatorFormInputProps) {
  const [displayValue, setDisplayValue] = useState("0");

  // Format the initial value
  useEffect(() => {
    if (defaultValue !== undefined) {
      setDisplayValue(formatToCurrency(defaultValue));
    }
  }, [defaultValue]);

  // Update form value and display value when user inputs
  const handleChange = (e: any) => {
    const numericValue = parseNumber(e.target.value);
    setDisplayValue(formatToCurrency(numericValue));

    setValue(fieldName, numericValue, { shouldValidate: true }); // Manually update the form state
  };

  return (
    <Input
      type="text"
      value={displayValue}
      prefix="Rp "
      label={label}
      placeholder="xxx.xxx.xxx"
      error={error}
      readOnly={readOnly}
      onChange={handleChange}
      inputClassName={readOnly ? "bg-gray-100" : ""}
    />
  );
}
