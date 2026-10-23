'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { parseISO } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDoctorOptions } from '@/hooks/use-doctors';
import { type PatientChanges, useUpdatePatient } from '@/hooks/use-patients';
import { getApiErrorMessage } from '@/lib/api-error';
import { applyApiFieldErrors } from '@/lib/form-errors';
import { type EditPatientValues, editPatientSchema } from '@/schemas/patient.schema';
import type { Patient } from '@/types/patient';

import { PATIENT_FORM_FIELDS, PatientFormFields } from './patient-form-fields';
import { toE164 } from '@/lib/phone';

const EDIT_FIELDS = [...PATIENT_FORM_FIELDS, 'doctorId'] as const;

const toFormValues = (patient: Patient): EditPatientValues => ({
  name: patient.name,
  age: patient.age,
  gender: patient.gender,
  phone: toE164(patient.phone),
  condition: patient.condition,
  admittedAt: parseISO(patient.admittedAt),
  notes: patient.notes,
  doctorId: patient.doctorId,
});

interface EditPatientFormProps {
  patient: Patient;
  onDone: () => void;
  onPendingChange: (isPending: boolean) => void;
}

function EditPatientForm({ patient, onDone, onPendingChange }: EditPatientFormProps) {
  const updatePatient = useUpdatePatient();
  const { data: doctors, isLoading: isLoadingDoctors } = useDoctorOptions();

  const form = useForm<EditPatientValues>({
    resolver: zodResolver(editPatientSchema),
    defaultValues: toFormValues(patient),
    mode: 'onTouched',
  });
  const { isDirty, dirtyFields } = form.formState;

  // The current doctor stays selectable even if they're outside the first 50 options.
  const doctorOptions =
    patient.doctor && !doctors?.some((doctor) => doctor._id === patient.doctor?._id)
      ? [patient.doctor, ...(doctors ?? [])]
      : (doctors ?? []);

  const onSubmit = (values: EditPatientValues) => {
    // Send only what changed, so a stale form can't overwrite someone else's edits.
    const changes = Object.fromEntries(
      Object.entries(values).filter(([key]) => dirtyFields[key as keyof EditPatientValues]),
    ) as PatientChanges;

    onPendingChange(true);
    updatePatient.mutate(
      { patientId: patient._id, changes },
      {
        onSuccess: (updated) => {
          const reassigned = changes.doctorId && updated.doctor;
          toast.success(
            reassigned
              ? `${updated.name} was reassigned to ${updated.doctor?.name}`
              : `${updated.name} was updated`,
          );
          onDone();
        },
        onError: (error) => {
          if (!applyApiFieldErrors(error, form.setError, EDIT_FIELDS)) {
            toast.error(getApiErrorMessage(error, 'Could not save the changes. Please try again.'));
          }
        },
        onSettled: () => onPendingChange(false),
      },
    );
  };

  return (
    <>
      <Form {...form}>
        <form
          id="edit-patient-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doctor</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isLoadingDoctors && doctorOptions.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className="w-full" onBlur={field.onBlur} ref={field.ref}>
                      <SelectValue placeholder="Select a doctor" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctorOptions.map((doctor) => (
                      <SelectItem key={doctor._id} value={doctor._id}>
                        {doctor.name}
                        <span className="text-muted-foreground">· {doctor.specialization}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <PatientFormFields />
        </form>
      </Form>

      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={updatePatient.isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="edit-patient-form"
          disabled={!isDirty || updatePatient.isPending}
        >
          {updatePatient.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {updatePatient.isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogFooter>
    </>
  );
}

interface EditPatientDialogProps {
  /** The patient being edited; `null` closes the dialog. */
  patient: Patient | null;
  onClose: () => void;
}

export function EditPatientDialog({ patient, onClose }: EditPatientDialogProps) {
  // While saving, the dialog can't be dismissed (Esc / outside click / close button).
  const [isPending, setPending] = useState(false);

  return (
    <Dialog open={patient !== null} onOpenChange={(open) => !open && !isPending && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit patient</DialogTitle>
          <DialogDescription>Update details or reassign to another doctor.</DialogDescription>
        </DialogHeader>
        {patient && (
          // Keyed so every patient starts from a fresh form with their own values.
          <EditPatientForm
            key={patient._id}
            patient={patient}
            onDone={onClose}
            onPendingChange={setPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
