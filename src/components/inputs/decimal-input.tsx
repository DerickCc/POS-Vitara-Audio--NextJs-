import { formatToDecimal, parseDecimal } from '@/utils/helper-function';
import { useEffect, useState } from 'react';
import { Input } from 'rizzui';

type DecimalInputProps = {
  defaultValue: number;
  onChange: (value: number) => void
  label?: string;
  readOnly?: boolean;
  error?: string;
  className?: string;
};

export default function DecimalInput({
  defaultValue,
  onChange,
  label,
  readOnly = false,
  error,
  className,
}: DecimalInputProps) {
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
      setDisplayValue(formatToDecimal(numericValue));
      onChange(numericValue);
    } else {
      setDisplayValue(inputValue);
    }
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      label={label}
      placeholder="xxx,xx"
      error={error}
      readOnly={readOnly}
      className={className}
      inputClassName={readOnly ? 'bg-gray-100' : ''}
    />
  );
}
