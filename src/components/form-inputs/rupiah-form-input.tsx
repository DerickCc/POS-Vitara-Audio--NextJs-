import cn from '@/utils/class-names';
import { formatToCurrency, parseNumber } from '@/utils/helper-function';
import { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Input } from 'rizzui';
import React__default from 'react';

type RupiahFormInputProps = {
  className?: string;
  inputClassName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  setValue: UseFormSetValue<any>; // Pass setValue from useForm
  onChange?: (value: number) => void; // to process changes from other component
  label?: React__default.ReactNode;
  fieldName: string;
  defaultValue: number;
  readOnly?: boolean;
  error?: string;
};

export default function RupiahFormInput({
  className,
  inputClassName,
  size = 'md',
  setValue,
  onChange = (value: number) => null,
  label,
  fieldName,
  defaultValue,
  readOnly = false,
  error,
}: RupiahFormInputProps) {
  const [displayValue, setDisplayValue] = useState('0');

  // Format the initial value
  useEffect(() => {
    if (defaultValue !== undefined) {
      setDisplayValue(formatToCurrency(defaultValue));
    }
  }, [defaultValue, displayValue]);

  // Update form value and display value when user inputs
  const handleChange = (e: any) => {
    const numericValue = parseNumber(e.target.value);
    setDisplayValue(formatToCurrency(numericValue));

    setValue(fieldName, numericValue, { shouldValidate: true }); // Manually update the form state
    onChange(numericValue);
  };

  return (
    <Input
      type='text'
      size={size}
      value={displayValue}
      prefix='Rp '
      label={label}
      placeholder='xxx.xxx.xxx'
      error={error}
      readOnly={readOnly}
      onChange={handleChange}
      className={className}
      inputClassName={cn(inputClassName, readOnly ? 'bg-gray-100/70' : '')}
    />
  );
}
