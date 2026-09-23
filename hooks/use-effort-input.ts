import { useMemo, useState } from "react";
import { effortUnitToMinutes, type EffortUnit } from "@/lib/effort";

/** Value/unit/minutes state for an effort input, shared by task-create-modal and task-edit-modal. */
export function useEffortInput(initialValue: number, initialUnit: EffortUnit) {
  const [effortValue, setEffortValue] = useState<number>(initialValue);
  const [effortUnit, setEffortUnit] = useState<EffortUnit>(initialUnit);
  const effortMinutes = useMemo(
    () => effortUnitToMinutes(effortValue, effortUnit),
    [effortValue, effortUnit]
  );

  function handleEffortUnitChange(unit: EffortUnit): void {
    setEffortValue(1);
    setEffortUnit(unit);
  }

  function reset(value: number, unit: EffortUnit): void {
    setEffortValue(value);
    setEffortUnit(unit);
  }

  return { effortValue, setEffortValue, effortUnit, handleEffortUnitChange, effortMinutes, reset };
}
