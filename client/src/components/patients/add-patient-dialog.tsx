'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { DatePicker } from '@/components/shared/date-picker';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAddPatient } from '@/hooks/use-doctor';
import { getApiErrorMessage } from '@/lib/api-error';
import { applyApiFieldErrors } from '@/lib/form-errors';
import {
  type AddPatientValues,
  addPatientSchema,
  PATIENT_GENDER_OPTIONS,
} from '@/schemas/patient.schema';

const FIELDS = ['name', 'age', 'gender', 'phone', 'condition', 'admittedAt', 'notes'] as const;

const emptyValues = (): Partial<AddPatientValues> => ({
  name: '',
  age: undefined,
  gender: undefined,
  phone: '',
  condition: '',
  admittedAt: new Date(),
  notes: '',
});

interface AddPatientDialogProps {
  doctorId: string;
  doctorName: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPatientDialog({
  doctorId,
  doctorName,
  open,
  onOpenChange,
}: AddPatientDialogProps) {
  const addPatient = useAddPatient(doctorId);

  const form = useForm<AddPatientValues>({
    resolver: zodResolver(addPatientSchema),
    defaultValues: emptyValues(),
    mode: 'onTouched',
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (addPatient.isPending) return;
    if (!nextOpen) {
      form.reset(emptyValues());
      addPatient.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = (values: AddPatientValues) => {
    addPatient.mutate(values, {
      onSuccess: (patient) => {
        toast.success(`${patient.name} was added`);
        form.reset(emptyValues());
        onOpenChange(false);
      },
      onError: (error) => {
        if (!applyApiFieldErrors(error, form.setError, FIELDS)) {
          toast.error(getApiErrorMessage(error, 'Could not add the patient. Please try again.'));
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add patient</DialogTitle>
          <DialogDescription>
            {doctorName ? `Assign a new patient to ${doctorName}.` : 'Assign a new patient.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="add-patient-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4"
            noValidate
          >
            <FormField
              control={form.control}
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
                control={form.control}
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
                          onChange(
                            event.target.value === '' ? undefined : event.target.valueAsNumber,
                          )
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="tel"
                        placeholder="+880 1811-000000"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
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
              control={form.control}
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
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Notes <span className="font-normal text-muted-foreground">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Allergies, follow-up plans…"
                      className="max-h-40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={addPatient.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="add-patient-form" disabled={addPatient.isPending}>
            {addPatient.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {addPatient.isPending ? 'Adding…' : 'Add patient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
