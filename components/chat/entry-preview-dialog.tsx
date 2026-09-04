"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormattedEntry } from "@/types/chat";

interface EntryPreviewDialogProps {
  entry: FormattedEntry;
  open: boolean;
  onConfirm: (entry: FormattedEntry) => Promise<void>;
  onCancel: () => void;
}

export function EntryPreviewDialog({ entry, open, onConfirm, onCancel }: EntryPreviewDialogProps): React.JSX.Element {
  const [edited, setEdited] = useState(entry);
  const [submitting, setSubmitting] = useState(false);

  async function handleConfirm(): Promise<void> {
    setSubmitting(true);
    try {
      await onConfirm(edited);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={edited.title} onChange={(e) => setEdited({ ...edited, title: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Project</Label>
            <Input value={edited.projectName} onChange={(e) => setEdited({ ...edited, projectName: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Effort %</Label>
            <Input
              type="number"
              value={edited.effortPercent}
              onChange={(e) => setEdited({ ...edited, effortPercent: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label>Start date</Label>
            <Input type="date" value={edited.startDate} onChange={(e) => setEdited({ ...edited, startDate: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? "Saving…" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
