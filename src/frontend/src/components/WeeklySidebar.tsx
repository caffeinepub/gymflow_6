import { Progress } from "@/components/ui/progress";
import { CalendarDays, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import type { ScheduledWorkout, WeeklyLog } from "../backend.d";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

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

function formatScheduledDate(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface WeeklySidebarProps {
  weeklyLog: WeeklyLog | null | undefined;
  isLoading: boolean;
  scheduledWorkouts?: ScheduledWorkout[];
}

export function WeeklySidebar({
  weeklyLog,
  isLoading,
  scheduledWorkouts = [],
}: WeeklySidebarProps) {
  const weekDates = getWeekDates();
  const today = new Date().toISOString().split("T")[0];

  const dayMap = new Map<string, boolean>();
  if (weeklyLog) {
    for (const d of weeklyLog.days) {
      dayMap.set(d.date, d.isComplete);
    }
  }

  const completedThisWeek = weekDates.filter(
    (d) => dayMap.get(d) === true,
  ).length;
  const completionPct = (completedThisWeek / 7) * 100;

  // Upcoming scheduled workouts (future dates, sorted)
  const upcomingScheduled = scheduledWorkouts
    .filter((sw) => sw.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  const personalRecords = [
    { label: "Squat", value: "100 kg", delta: "+5 kg" },
    { label: "Deadlift", value: "140 kg", delta: "+10 kg" },
    { label: "Bench Press", value: "80 kg", delta: "+2.5 kg" },
  ];

  return (
    <aside className="flex flex-col gap-4">
      {/* Weekly Completion */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-xl border border-border bg-card p-5 shadow-card"
        data-ocid="weekly.panel"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-foreground">
            Weekly Completion
          </h3>
          <span className="text-sm font-semibold text-lime">
            {completedThisWeek}/7
          </span>
        </div>

        <Progress value={completionPct} className="mb-4 h-2.5 bg-muted" />

        {/* Day pills */}
        {isLoading ? (
          <div className="flex gap-2" data-ocid="weekly.loading_state">
            {DAY_LABELS.map((label) => (
              <div
                key={`skeleton-${label}`}
                className="h-9 flex-1 animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        ) : (
          <div className="flex gap-1.5">
            {weekDates.map((date, i) => {
              const isCompleted = dayMap.get(date) === true;
              const isToday = date === today;
              const isFuture = date > today;
              return (
                <div
                  key={date}
                  className={`flex flex-1 flex-col items-center gap-1 rounded-md border py-2 transition-all ${
                    isCompleted
                      ? "border-lime bg-lime/20 text-lime"
                      : isToday
                        ? "border-lime/50 bg-lime/5 text-foreground"
                        : isFuture
                          ? "border-border/50 bg-muted/20 text-muted-foreground/50"
                          : "border-border bg-muted/30 text-muted-foreground"
                  }`}
                  data-ocid={`weekly.item.${i + 1}`}
                >
                  <span className="text-[10px] font-bold">{DAY_LABELS[i]}</span>
                  {isCompleted && <span className="text-[10px]">✓</span>}
                  {!isCompleted && isToday && (
                    <span className="h-1 w-1 rounded-full bg-lime" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Upcoming Schedule */}
      {upcomingScheduled.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-xl border border-border bg-card p-5 shadow-card"
          data-ocid="schedule.panel"
        >
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-lime" />
            <h3 className="font-display text-base font-bold text-foreground">
              Upcoming Schedule
            </h3>
          </div>
          <div className="space-y-2">
            {upcomingScheduled.map((sw, i) => (
              <div
                key={sw.date}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2"
                data-ocid={`schedule.item.${i + 1}`}
              >
                <span className="text-sm font-medium text-foreground">
                  {formatScheduledDate(sw.date)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {sw.workoutDay.exercises.length} exercises
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Personal Records */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-xl border border-border bg-card p-5 shadow-card"
        data-ocid="stats.panel"
      >
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-lime" />
          <h3 className="font-display text-base font-bold text-foreground">
            Personal Records
          </h3>
        </div>
        <div className="space-y-3">
          {personalRecords.map((pr, i) => (
            <div
              key={pr.label}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2"
              data-ocid={`stats.item.${i + 1}`}
            >
              <span className="text-sm font-medium text-foreground">
                {pr.label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">
                  {pr.value}
                </span>
                <span className="text-xs font-semibold text-lime">
                  {pr.delta}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Today's Target */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="rounded-xl border border-border bg-card p-5 shadow-card"
        data-ocid="info.panel"
      >
        <h3 className="mb-3 font-display text-base font-bold text-foreground">
          Today's Target
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Exercises", value: "4" },
            { label: "Est. Time", value: "45 min" },
            { label: "Total Sets", value: "16" },
            { label: "Difficulty", value: "Medium" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border border-border bg-muted/20 p-3 text-center"
            >
              <p className="text-lg font-bold text-foreground">{item.value}</p>
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </aside>
  );
}
