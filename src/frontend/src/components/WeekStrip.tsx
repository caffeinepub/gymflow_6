import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { ScheduledWorkout } from "../backend.d";

const DAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekDates(): string[] {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

interface WeekStripProps {
  scheduledWorkouts: ScheduledWorkout[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function WeekStrip({
  scheduledWorkouts,
  selectedDate,
  onSelectDate,
}: WeekStripProps) {
  const weekDates = getWeekDates();
  const today = new Date().toISOString().split("T")[0];
  const scheduledDates = new Set(scheduledWorkouts.map((sw) => sw.date));

  return (
    <div
      className="mb-6 rounded-xl border border-border bg-card p-4"
      data-ocid="schedule.panel"
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
          This Week
        </h3>
        <span className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {weekDates.map((date, i) => {
          const isToday = date === today;
          const isSelected = date === selectedDate;
          const hasWorkout = scheduledDates.has(date);
          const dateNum = new Date(`${date}T00:00:00`).getDate();

          return (
            <motion.button
              key={date}
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => onSelectDate(date)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg border py-2 text-center transition-all",
                isSelected
                  ? "border-lime bg-lime/20 text-lime"
                  : isToday
                    ? "border-lime/40 bg-lime/5 text-foreground"
                    : "border-border bg-muted/20 text-muted-foreground hover:border-lime/30 hover:text-foreground",
              )}
              data-ocid={`schedule.tab.${i + 1}`}
            >
              <span className="text-[10px] font-bold uppercase">
                {DAY_SHORT[i]}
              </span>
              <span
                className={cn(
                  "text-base font-bold leading-none",
                  isSelected && "text-lime",
                )}
              >
                {dateNum}
              </span>
              {hasWorkout ? (
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isSelected ? "bg-lime" : "bg-lime/60",
                  )}
                />
              ) : (
                <span className="h-1.5 w-1.5" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
