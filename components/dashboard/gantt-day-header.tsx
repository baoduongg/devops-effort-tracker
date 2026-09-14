interface GanttDayHeaderProps {
  days: Date[];
}

/** Shared day-cell strip for the team and per-member Gantt timelines: today/weekend highlighting. */
export function GanttDayHeader({ days }: GanttDayHeaderProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-14 gap-1 text-center">
      {days.map((day, idx) => {
        const isToday = day.toDateString() === new Date().toDateString();
        const isWeekend = day.getDay() === 0 || day.getDay() === 6;
        return (
          <div
            key={idx}
            className={`text-xs py-1.5 rounded-lg flex flex-col items-center justify-center transition-all ${
              isToday
                ? "bg-accent/20 text-accent font-bold border border-accent/40 shadow-sm"
                : isWeekend
                ? "text-secondary bg-surface"
                : "text-primary bg-surface"
            }`}
          >
            <span className="text-xs uppercase font-semibold opacity-70">
              {day.toLocaleDateString("en-US", { weekday: "narrow" })}
            </span>
            <span className="text-xs">{day.getDate()}</span>
          </div>
        );
      })}
    </div>
  );
}
