'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { useAddPatient } from '@/hooks/use-doctor';
import { getApiErrorMessage } from '@/lib/api-error';
import { applyApiFieldErrors } from '@/lib/form-errors';
import { type AddPatientValues, addPatientSchema } from '@/schemas/patient.schema';

import { PATIENT_FORM_FIELDS, PatientFormFields } from './patient-form-fields';

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
        if (!applyApiFieldErrors(error, form.setError, PATIENT_FORM_FIELDS)) {
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
            <PatientFormFields />
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
