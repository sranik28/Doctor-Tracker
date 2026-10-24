'use client';

import { Loader2, Pencil } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useUpdatePatient } from '@/hooks/use-patients';
import { getApiErrorMessage } from '@/lib/api-error';
import type { Patient } from '@/types/patient';

const MAX_NOTES_LENGTH = 2000;

/** The patient's notes, editable in place. */
export function PatientNotesCard({ patient }: { patient: Patient }) {
  const updatePatient = useUpdatePatient();
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = draft !== null;

  const save = () => {
    if (draft === null) return;
    const notes = draft.trim();
    if (notes === patient.notes) {
      setDraft(null);
      return;
    }
    updatePatient.mutate(
      { patientId: patient._id, changes: { notes } },
      {
        onSuccess: () => {
          toast.success('Notes saved');
          setDraft(null);
        },
        onError: (error) =>
          toast.error(getApiErrorMessage(error, 'Could not save the notes. Please try again.')),
      },
    );
  };

  return (
    <Card>
      <CardContent className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Notes</h2>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setDraft(patient.notes)}>
              <Pencil aria-hidden="true" />
              {patient.notes ? 'Edit notes' : 'Add notes'}
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="grid gap-3">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Allergies, follow-up plans…"
              maxLength={MAX_NOTES_LENGTH}
              className="min-h-28"
              aria-label="Patient notes"
              autoFocus
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {draft.length}/{MAX_NOTES_LENGTH}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDraft(null)}
                  disabled={updatePatient.isPending}
                >
                  Cancel
                </Button>
                <Button onClick={save} disabled={updatePatient.isPending}>
                  {updatePatient.isPending && (
                    <Loader2 className="animate-spin" aria-hidden="true" />
                  )}
                  {updatePatient.isPending ? 'Saving…' : 'Save notes'}
                </Button>
              </div>
            </div>
          </div>
        ) : patient.notes ? (
          <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No notes for this patient.</p>
        )}
      </CardContent>
    </Card>
  );
}
