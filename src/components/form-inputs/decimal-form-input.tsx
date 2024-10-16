import { formatToDecimal, parseDecimal } from '@/utils/helper-function';
import { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Input } from 'rizzui';

type DecimalFormInputProps = {
  setValue: UseFormSetValue<any>; // Pass setValue from useForm
  limit?: number;
  onChange?: (value: number) => void; // to process changes from other component
  label?: string;
  fieldName: string;
  defaultValue: number;
  readOnly?: boolean;
  error?: string;
};

export default function DecimalFormInput({
  setValue,
  limit = 0,
  onChange = (value: number) => null,
  label,
  fieldName,
  defaultValue,
  readOnly = false,
  error,
}: DecimalFormInputProps) {
  const [displayValue, setDisplayValue] = useState('0');

  // init displayValue
  useEffect(() => {
    if (defaultValue !== undefined) {
      setDisplayValue(formatToDecimal(defaultValue));
    }
  }, [defaultValue]);

  // Update form value and display value when user inputs
  const handleChange = (e: any) => {
    const inputValue = e.target.value;

    if (inputValue.slice(-1) !== ',') {
      const numericValue = parseDecimal(inputValue);

      // if have limit and is over the limit
      if (limit !== 0 && numericValue > limit) setDisplayValue(formatToDecimal(limit));
      else setDisplayValue(formatToDecimal(numericValue));

      setValue(fieldName, numericValue, { shouldValidate: true }); // Manually update the form state
      onChange(numericValue);
      return;
    } else {
      setDisplayValue(inputValue);
    }
    onChange(defaultValue);
  };

  return (
    <Input
      type='text'
      value={displayValue}
      label={label}
      placeholder='xxx,xx'
      error={error}
      readOnly={readOnly}
      onChange={handleChange}
      inputClassName={readOnly ? 'bg-gray-100' : ''}
    />
  );
}
