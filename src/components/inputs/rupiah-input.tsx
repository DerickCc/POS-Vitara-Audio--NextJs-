import { formatToReadableNumber, parseNumber } from '@/utils/helper-function';
import { useEffect, useState } from 'react';
import { Input } from 'rizzui';

type RupiahInputProps = {
  defaultValue: number;
  onChange: (value: number) => void;
  label?: string;
  readOnly?: boolean;
  error?: string;
  className?: string;
};

export default function RupiahInput({
  defaultValue,
  onChange,
  label,
  readOnly = false,
  error,
  className,
}: RupiahInputProps) {
  const [displayValue, setDisplayValue] = useState('0');

  // Format the initial value
  useEffect(() => {
    if (defaultValue !== undefined) {
      setDisplayValue(formatToReadableNumber(defaultValue));
    }
  }, [defaultValue]);

  // Update form value and display value when user inputs
  const handleChange = (e: any) => {
    const numericValue = parseNumber(e.target.value);
    setDisplayValue(formatToReadableNumber(numericValue));
    onChange(numericValue);
  };

  return (
    <Input
      type='text'
      value={displayValue}
      onChange={handleChange}
      prefix='Rp '
      label={label}
      placeholder='xxx.xxx.xxx'
      error={error}
      readOnly={readOnly}
      className={className}
      inputClassName={readOnly ? 'bg-gray-100' : ''}
    />
  );
}
