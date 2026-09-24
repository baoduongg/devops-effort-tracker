export type AlarmStatus = "active" | "done" | "cancelled";

export interface Alarm {
  id: string;
  /** Người thực hiện (required). */
  memberId: string;
  /** Người giám sát (optional). */
  supervisorId: string | null;
  content: string;
  /** Free-text project label (optional, not linked to the projects collection). */
  projectName: string | null;
  time: string;
  status: AlarmStatus;
  firedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AlarmInput = Omit<Alarm, "id" | "createdAt" | "updatedAt">;
