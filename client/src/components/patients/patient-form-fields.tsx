'use client';

import { useFormContext } from 'react-hook-form';

import { DatePicker } from '@/components/shared/date-picker';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { type AddPatientValues, PATIENT_GENDER_OPTIONS } from '@/schemas/patient.schema';
import { PhoneField } from '@/components/shared/phone-field';

/** Field names these inputs render, for mapping server field errors back onto them. */
export const PATIENT_FORM_FIELDS = [
  'name',
  'age',
  'gender',
  'phone',
  'condition',
  'admittedAt',
  'notes',
] as const;

/**
 * The patient fields shared by the add and edit dialogs. Reads the form from context, so it
 * works inside any <Form> whose values include AddPatientValues (edit adds doctorId).
 */
export function PatientFormFields() {
  const { control } = useFormContext<AddPatientValues>();

  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full name</FormLabel>
            <FormControl>
              <Input placeholder="Karim Uddin" autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="age"
          render={({ field: { value, onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={120}
                  placeholder="42"
                  value={value ?? ''}
                  onChange={(event) =>
                    onChange(event.target.value === '' ? undefined : event.target.valueAsNumber)
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="gender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gender</FormLabel>
              <Select value={field.value ?? ''} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full" onBlur={field.onBlur} ref={field.ref}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PATIENT_GENDER_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <PhoneField
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="1811-000000"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="admittedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admitted on</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={(date) => {
                    field.onChange(date);
                    field.onBlur();
                  }}
                  disabledDays={{ after: new Date() }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="condition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Condition</FormLabel>
            <FormControl>
              <Input placeholder="Hypertension" autoComplete="off" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Notes <span className="font-normal text-muted-foreground">(optional)</span>
            </FormLabel>
            <FormControl>
              <Textarea placeholder="Allergies, follow-up plans…" className="max-h-40" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
