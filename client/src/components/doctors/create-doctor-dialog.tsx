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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateDoctor, useDoctorFilterOptions } from '@/hooks/use-doctors';
import { getApiErrorMessage } from '@/lib/api-error';
import { applyApiFieldErrors } from '@/lib/form-errors';
import { type CreateDoctorValues, createDoctorSchema } from '@/schemas/doctor.schema';

const EMPTY_VALUES: CreateDoctorValues = {
  name: '',
  specialization: '',
  hospital: '',
  phone: '',
  email: '',
};

const FIELDS = ['name', 'specialization', 'hospital', 'phone', 'email'] as const;

interface CreateDoctorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDoctorDialog({ open, onOpenChange }: CreateDoctorDialogProps) {
  const createDoctor = useCreateDoctor();
  const { data: options } = useDoctorFilterOptions();

  const form = useForm<CreateDoctorValues>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: EMPTY_VALUES,
    mode: 'onTouched',
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (createDoctor.isPending) return;
    if (!nextOpen) {
      form.reset(EMPTY_VALUES);
      createDoctor.reset();
    }
    onOpenChange(nextOpen);
  };

  const onSubmit = (values: CreateDoctorValues) => {
    createDoctor.mutate(values, {
      onSuccess: (doctor) => {
        toast.success(`${doctor.name} was added`);
        form.reset(EMPTY_VALUES);
        onOpenChange(false);
      },
      onError: (error) => {
        // Field-level problems (e.g. duplicate email) go on the field; anything else is a toast.
        if (!applyApiFieldErrors(error, form.setError, FIELDS)) {
          toast.error(getApiErrorMessage(error, 'Could not add the doctor. Please try again.'));
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add doctor</DialogTitle>
          <DialogDescription>New doctors appear in the list right away.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id="create-doctor-form"
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
                    <Input placeholder="Dr. Jane Doe" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        inputMode="email"
                        placeholder="jane@hospital.com"
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
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        inputMode="tel"
                        placeholder="+880 1711-000000"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Suggest existing values so filters don't fragment into "Cardiology" vs "cardiology". */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specialization</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Cardiology"
                        list="doctor-specializations"
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
                name="hospital"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Square Hospital"
                        list="doctor-hospitals"
                        autoComplete="off"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <datalist id="doctor-specializations">
              {options?.specializations.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
            <datalist id="doctor-hospitals">
              {options?.hospitals.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
          </form>
        </Form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={createDoctor.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" form="create-doctor-form" disabled={createDoctor.isPending}>
            {createDoctor.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
            {createDoctor.isPending ? 'Adding…' : 'Add doctor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
