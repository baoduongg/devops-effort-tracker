interface GanttDayHeaderProps {
  days: Date[];
}

const VN_DAY_NAMES = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

/** Shared day-cell strip for the team and per-member Gantt timelines: today/weekend highlighting. */
export function GanttDayHeader({ days }: GanttDayHeaderProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-14 gap-1 text-center font-mono">
      {days.map((day, idx) => {
        const isToday = day.toDateString() === new Date().toDateString();
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        const dayLabel = VN_DAY_NAMES[day.getDay()];
        return (
          <div
            key={idx}
            className={`text-xs py-1.5 px-1 rounded-lg flex flex-col items-center justify-center transition-all ${
              isToday
                ? "bg-sky-500/20 text-sky-300 font-bold border border-sky-400/50 shadow-sm shadow-sky-500/20"
                : isWeekend
                ? "text-neutral-500 bg-white/[0.01]"
                : "text-neutral-300 bg-white/[0.03] hover:bg-white/[0.06]"
            }`}
          >
            <span className="text-[10px] uppercase font-semibold opacity-75">
              {dayLabel}
            </span>
            <span className="text-xs font-mono font-medium tabular-nums">{day.getDate()}</span>
          </div>
        );
      })}
    </div>
  );
}
