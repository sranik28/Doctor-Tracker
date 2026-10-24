'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useCreatePrescription, useUpdatePrescription } from '@/hooks/use-prescriptions';
import { getApiErrorMessage } from '@/lib/api-error';
import { applyApiFieldErrors } from '@/lib/form-errors';
import { type PrescriptionValues, prescriptionSchema } from '@/schemas/prescription.schema';
import type { Prescription } from '@/types/prescription';

const FIELDS = ['medicine', 'dosage', 'duration', 'instructions', 'prescribedAt'] as const;

const toFormValues = (prescription: Prescription | null): PrescriptionValues => ({
  medicine: prescription?.medicine ?? '',
  dosage: prescription?.dosage ?? '',
  duration: prescription?.duration ?? '',
  instructions: prescription?.instructions ?? '',
  prescribedAt: prescription ? new Date(prescription.prescribedAt) : new Date(),
});

interface PrescriptionFormProps {
  patientId: string;
  /** The prescription being edited; `null` adds a new one. */
  prescription: Prescription | null;
  onDone: () => void;
  onPendingChange: (pending: boolean) => void;
}

function PrescriptionForm({
  patientId,
  prescription,
  onDone,
  onPendingChange,
}: PrescriptionFormProps) {
  const create = useCreatePrescription(patientId);
  const update = useUpdatePrescription(patientId);
  const isPending = create.isPending || update.isPending;

  const form = useForm<PrescriptionValues>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: toFormValues(prescription),
    mode: 'onTouched',
  });

  const handlers = {
    onSuccess: () => {
      toast.success(prescription ? 'Prescription updated' : 'Prescription added');
      onDone();
    },
    onError: (error: unknown) => {
      if (!applyApiFieldErrors(error, form.setError, FIELDS)) {
        toast.error(
          getApiErrorMessage(error, 'Could not save the prescription. Please try again.'),
        );
      }
    },
    onSettled: () => onPendingChange(false),
  };

  const onSubmit = (values: PrescriptionValues) => {
    onPendingChange(true);
    if (prescription) update.mutate({ prescriptionId: prescription._id, values }, handlers);
    else create.mutate(values, handlers);
  };

  return (
    <>
      <Form {...form}>
        <form
          id="prescription-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="medicine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicine</FormLabel>
                <FormControl>
                  <Input placeholder="Paracetamol" autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="dosage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dosage</FormLabel>
                  <FormControl>
                    <Input placeholder="500 mg, twice a day" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration</FormLabel>
                  <FormControl>
                    <Input placeholder="7 days" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="prescribedAt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prescribed on</FormLabel>
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
          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions (optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="After meals" className="max-h-32" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" form="prescription-form" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {isPending ? 'Saving…' : prescription ? 'Save changes' : 'Add prescription'}
        </Button>
      </DialogFooter>
    </>
  );
}

interface PrescriptionDialogProps {
  patientId: string;
  open: boolean;
  /** Set to edit that prescription; leave `null` to add a new one. */
  prescription: Prescription | null;
  onClose: () => void;
}

export function PrescriptionDialog({
  patientId,
  open,
  prescription,
  onClose,
}: PrescriptionDialogProps) {
  // While saving, the dialog can't be dismissed (Esc / outside click / close button).
  const [isPending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && !isPending && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{prescription ? 'Edit prescription' : 'Add prescription'}</DialogTitle>
          <DialogDescription>Record what the doctor prescribed to this patient.</DialogDescription>
        </DialogHeader>
        {open && (
          // Keyed so every open starts from a fresh form with its own values.
          <PrescriptionForm
            key={prescription?._id ?? 'new'}
            patientId={patientId}
            prescription={prescription}
            onDone={onClose}
            onPendingChange={setPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
