import { formatToCurrency, parseNumber } from '@/utils/helper-function';
import { useEffect, useState } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { Input } from 'rizzui';

type RupiahFormInputProps = {
  className?: string;
  setValue: UseFormSetValue<any>; // Pass setValue from useForm
  onChange?: (value: number) => void; // to process changes from other component
  label?: string;
  fieldName: string;
  defaultValue: number;
  readOnly?: boolean;
  error?: string;
};

export default function RupiahFormInput({
  className,
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
  }, [defaultValue]);

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
      value={displayValue}
      prefix='Rp '
      label={label}
      placeholder='xxx.xxx.xxx'
      error={error}
      readOnly={readOnly}
      onChange={handleChange}
      className={className}
      inputClassName={readOnly ? 'bg-gray-100/70' : ''}
    />
  );
}
