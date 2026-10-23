'use client';

import PhoneInput from 'react-phone-number-input';
import flags from 'react-phone-number-input/flags';
import 'react-phone-number-input/style.css';

import { Input } from '@/components/ui/input';

interface PhoneFieldInputProps {
  /** E.164 ("+8801711123456") or empty. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-describedby'?: string;
}

/**
 * Country picker + formatted number input. Reports E.164 so the stored value is always one
 * canonical form. Flags are bundled (no CDN requests). Loaded lazily through PhoneField.
 */
export default function PhoneFieldInput({ value, onChange, ...inputProps }: PhoneFieldInputProps) {
  return (
    <PhoneInput
      {...inputProps}
      flags={flags}
      international
      defaultCountry="BD"
      countryCallingCodeEditable={false}
      inputComponent={Input}
      value={value || undefined}
      onChange={(next) => onChange(next ?? '')}
      autoComplete="off"
    />
  );
}
