import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Loader2, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { SetLog } from "./backend.d";
import { AdminPanel } from "./components/AdminPanel";
import { ExerciseCard } from "./components/ExerciseCard";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { WeekStrip } from "./components/WeekStrip";
import { WeeklySidebar } from "./components/WeeklySidebar";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useCompleteWorkout,
  useLogSet,
  useScheduledWorkouts,
  useSetLogs,
  useWeeklyLog,
  useWorkoutDay,
  useWorkoutDayByDate,
} from "./hooks/useQueries";

function LoginPrompt() {
  const { login, loginStatus } = useInternetIdentity();
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center"
      data-ocid="auth.panel"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-lime/30 bg-lime/10">
        <Lock className="h-9 w-9 text-lime" />
      </div>
      <div>
        <h2 className="mb-2 font-display text-3xl font-bold text-foreground">
          Welcome to GYMFLOW
        </h2>
        <p className="max-w-md text-muted-foreground">
          Log in to access your daily workout routine, track your sets and reps,
          and monitor your weekly progress.
        </p>
      </div>
      <Button
        onClick={() => login()}
        disabled={loginStatus === "logging-in"}
        className="h-12 min-w-[200px] bg-lime text-primary-foreground hover:bg-lime/90 font-semibold shadow-lime text-base"
        data-ocid="auth.login.button"
      >
        {loginStatus === "logging-in" ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          "Log In to Get Started"
        )}
      </Button>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const mainRef = useRef<HTMLDivElement>(null);
  const [isAdminView, setIsAdminView] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const isViewingToday = selectedDate === today;

  const { data: workoutDay, isLoading: loadingWorkout } = useWorkoutDay();
  const { data: setLogs } = useSetLogs();
  const { data: weeklyLog, isLoading: loadingWeekly } = useWeeklyLog();
  const { data: scheduledWorkouts = [] } = useScheduledWorkouts();
  const { data: selectedDayWorkout, isLoading: loadingSelected } =
    useWorkoutDayByDate(isViewingToday ? "" : selectedDate);
  const { mutate: logSet } = useLogSet();
  const { mutate: completeWorkout, isPending: completing } =
    useCompleteWorkout();

  // Use today's workout for today, otherwise use selected date workout
  const displayWorkout = isViewingToday ? workoutDay : selectedDayWorkout;
  const isLoadingDisplay = isViewingToday ? loadingWorkout : loadingSelected;
  const exercises = displayWorkout?.exercises ?? [];
  const workoutCompleted = isViewingToday
    ? (workoutDay?.isComplete ?? false)
    : false;

  function handleLogSet(log: SetLog) {
    logSet(log, {
      onError: () => toast.error("Failed to log set"),
    });
  }

  function handleMarkComplete() {
    completeWorkout(undefined, {
      onSuccess: () => toast.success("Workout complete! Great job! 💪"),
      onError: () => toast.error("Failed to mark workout complete"),
    });
  }

  function scrollToWorkout() {
    mainRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div
          className="flex flex-col items-center gap-4"
          data-ocid="app.loading_state"
        >
          <Loader2 className="h-10 w-10 animate-spin text-lime" />
          <p className="text-muted-foreground">Loading GYMFLOW...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.008 240)",
            border: "1px solid oklch(0.24 0.01 240)",
            color: "oklch(0.95 0.006 220)",
          },
        }}
      />
      <Header
        onStartSession={scrollToWorkout}
        onToggleAdmin={() => setIsAdminView((v) => !v)}
        isAdminView={isAdminView}
      />

      {!isLoggedIn ? (
        <main>
          <LoginPrompt />
        </main>
      ) : isAdminView ? (
        <main>
          <AdminPanel />
        </main>
      ) : (
        <main>
          {/* Hero */}
          <Hero isComplete={workoutCompleted} />

          {/* Content */}
          <div ref={mainRef} className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            {/* Week Strip */}
            <WeekStrip
              scheduledWorkouts={scheduledWorkouts}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            {isLoadingDisplay ? (
              <div
                className="flex flex-col items-center gap-4 py-20"
                data-ocid="workout.loading_state"
              >
                <Loader2 className="h-10 w-10 animate-spin text-lime" />
                <p className="text-muted-foreground">Loading workout...</p>
              </div>
            ) : exercises.length === 0 ? (
              <div
                className="flex flex-col items-center gap-4 py-20 text-center"
                data-ocid="workout.empty_state"
              >
                <p className="text-lg font-semibold text-muted-foreground">
                  No workout scheduled
                  {isViewingToday
                    ? " for today"
                    : ` for ${new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}`}
                  .
                </p>
                <p className="text-sm text-muted-foreground">
                  Check back later or contact your trainer.
                </p>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
                {/* Left: Exercise cards */}
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      {isViewingToday
                        ? "Today's"
                        : `${new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" })}'s`}{" "}
                      Exercises
                      <span className="ml-2 text-base font-normal text-muted-foreground">
                        ({exercises.length} exercises)
                      </span>
                    </h2>
                    {workoutCompleted && isViewingToday && (
                      <span className="rounded-full bg-lime/20 px-3 py-1 text-xs font-semibold text-lime">
                        ✓ Completed
                      </span>
                    )}
                  </div>

                  {exercises.map((exercise, i) => (
                    <ExerciseCard
                      key={exercise.name}
                      exercise={exercise}
                      index={i}
                      existingLogs={(setLogs ?? []).filter(
                        (l) => l.exerciseName === exercise.name,
                      )}
                      onLogSet={isViewingToday ? handleLogSet : () => {}}
                      onMarkComplete={
                        isViewingToday ? handleMarkComplete : () => {}
                      }
                      workoutCompleted={workoutCompleted || !isViewingToday}
                    />
                  ))}

                  {/* Complete all button — only for today */}
                  {isViewingToday && !workoutCompleted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <Button
                        onClick={handleMarkComplete}
                        disabled={completing}
                        className="w-full bg-lime text-primary-foreground hover:bg-lime/90 h-12 text-base font-semibold shadow-lime"
                        data-ocid="workout.submit_button"
                      >
                        {completing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Completing Workout...
                          </>
                        ) : (
                          "Complete Full Workout 💪"
                        )}
                      </Button>
                    </motion.div>
                  )}

                  {/* Read-only notice for non-today */}
                  {!isViewingToday && (
                    <div className="rounded-lg border border-border/50 bg-muted/10 px-4 py-3 text-center">
                      <p className="text-sm text-muted-foreground">
                        Viewing scheduled workout — interactive tracking only
                        available on the workout day.
                      </p>
                    </div>
                  )}
                </section>

                {/* Right: Sidebar */}
                <WeeklySidebar
                  weeklyLog={weeklyLog}
                  isLoading={loadingWeekly}
                  scheduledWorkouts={scheduledWorkouts}
                />
              </div>
            )}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()}. Built with{" "}
            <span className="text-lime">♥</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground underline hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
