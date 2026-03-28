import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Play,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Exercise, SetLog } from "../backend.d";

interface SetState {
  checked: boolean;
  reps: number;
  weight: number;
}

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  existingLogs: SetLog[];
  onLogSet: (log: SetLog) => void;
  onMarkComplete: () => void;
  workoutCompleted: boolean;
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{11})/,
  );
  return m ? m[1] : null;
}

const DESCRIPTION_LIMIT = 120;

export function ExerciseCard({
  exercise,
  index,
  existingLogs,
  onLogSet,
  onMarkComplete,
  workoutCompleted,
}: ExerciseCardProps) {
  const totalSets = Number(exercise.sets);
  const defaultReps = Number(exercise.reps);

  const [sets, setSets] = useState<SetState[]>(() =>
    Array.from({ length: totalSets }, () => ({
      checked: false,
      reps: defaultReps,
      weight: 0,
    })),
  );
  const [exerciseDone, setExerciseDone] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    if (existingLogs.length > 0) {
      setSets((prev) =>
        prev.map((s, i) => {
          const log = existingLogs[i];
          if (log)
            return {
              checked: true,
              reps: Number(log.reps),
              weight: log.weight,
            };
          return s;
        }),
      );
    }
  }, [existingLogs]);

  const checkedCount = sets.filter((s) => s.checked).length;
  const progressPct = totalSets > 0 ? (checkedCount / totalSets) * 100 : 0;
  const allChecked = checkedCount === totalSets;
  const videoId = extractYouTubeId(exercise.videoUrl);

  const description = exercise.description ?? "";
  const isLongDesc = description.length > DESCRIPTION_LIMIT;
  const displayedDesc =
    isLongDesc && !descExpanded
      ? `${description.slice(0, DESCRIPTION_LIMIT)}…`
      : description;

  function toggleSet(i: number) {
    if (exerciseDone || workoutCompleted) return;
    setSets((prev) => {
      const next = prev.map((s, idx) =>
        idx === i ? { ...s, checked: !s.checked } : s,
      );
      const wasUnchecked = !prev[i].checked;
      if (wasUnchecked) {
        onLogSet({
          exerciseName: exercise.name,
          reps: BigInt(next[i].reps),
          weight: next[i].weight,
        });
      }
      return next;
    });
  }

  function updateSet(i: number, field: "reps" | "weight", val: number) {
    setSets((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
    );
  }

  function handleMarkComplete() {
    setExerciseDone(true);
    onMarkComplete();
  }

  const isCompleted = exerciseDone || workoutCompleted;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`overflow-hidden rounded-xl border bg-card shadow-card transition-all ${
        isCompleted ? "border-lime/40" : "border-border"
      }`}
      data-ocid={`exercise.item.${index + 1}`}
    >
      {/* Video area */}
      <div className="relative bg-muted" style={{ aspectRatio: "16/7" }}>
        {showVideo && videoId ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={exercise.name}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-3 bg-gradient-to-br from-muted to-background"
            onClick={() => setShowVideo(true)}
            data-ocid={`exercise.play.${index + 1}`}
          >
            {videoId ? (
              <>
                <img
                  src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                  alt={exercise.name}
                  className="absolute inset-0 h-full w-full object-cover opacity-40"
                />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-lime shadow-lime">
                  <Play
                    className="h-6 w-6 text-primary-foreground"
                    fill="currentColor"
                  />
                </div>
                <span className="relative text-sm font-medium text-foreground">
                  Watch Demo
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Play className="h-8 w-8" />
                <span className="text-sm">No video</span>
              </div>
            )}
          </button>
        )}
      </div>

      <div className="p-5">
        {/* Category + title */}
        <div className="mb-3">
          <Badge className="mb-2 border-none bg-lime/15 text-xs font-semibold uppercase tracking-wide text-lime">
            {exercise.category}
          </Badge>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xl font-bold text-foreground">
              {exercise.name}
            </h3>
            {isCompleted && (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-lime" />
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalSets} Sets &times; {defaultReps} Reps
          </p>

          {/* Description */}
          {description.length > 0 && (
            <div className="mt-2">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {displayedDesc}
              </p>
              {isLongDesc && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-1 flex items-center gap-1 text-xs font-medium text-lime hover:text-lime/80 transition-colors"
                  data-ocid={`exercise.toggle.${index + 1}`}
                >
                  {descExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" /> Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" /> Show more
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Set rows */}
        <div className="mb-4 space-y-2">
          {sets.map((s, i) => (
            <div
              key={`set-${exercise.name}-${i}`}
              className={`flex items-center gap-3 rounded-lg border p-2.5 transition-colors ${
                s.checked
                  ? "border-lime/30 bg-lime/5"
                  : "border-border bg-secondary/30"
              }`}
              data-ocid={`exercise.row.${index + 1}`}
            >
              <button
                type="button"
                onClick={() => toggleSet(i)}
                className="shrink-0 transition-transform active:scale-90"
                disabled={isCompleted}
                data-ocid={`exercise.checkbox.${index + 1}`}
              >
                {s.checked ? (
                  <CheckCircle2 className="h-5 w-5 text-lime" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              <span className="w-12 shrink-0 text-xs font-semibold text-muted-foreground">
                Set {i + 1}
              </span>
              <div className="flex flex-1 items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <label
                    htmlFor={`reps-${exercise.name}-${i}`}
                    className="text-[10px] text-muted-foreground"
                  >
                    Reps
                  </label>
                  <Input
                    id={`reps-${exercise.name}-${i}`}
                    type="number"
                    value={s.reps}
                    min={1}
                    onChange={(e) =>
                      updateSet(i, "reps", Number(e.target.value))
                    }
                    className="h-7 w-16 border-border bg-muted/50 text-center text-sm"
                    disabled={isCompleted}
                    data-ocid={`exercise.input.${index + 1}`}
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <label
                    htmlFor={`weight-${exercise.name}-${i}`}
                    className="text-[10px] text-muted-foreground"
                  >
                    Weight (kg)
                  </label>
                  <Input
                    id={`weight-${exercise.name}-${i}`}
                    type="number"
                    value={s.weight}
                    min={0}
                    step={2.5}
                    onChange={(e) =>
                      updateSet(i, "weight", Number(e.target.value))
                    }
                    className="h-7 w-20 border-border bg-muted/50 text-center text-sm"
                    disabled={isCompleted}
                    data-ocid={`exercise.input.${index + 1}`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>
              {checkedCount}/{totalSets} sets
            </span>
          </div>
          <Progress value={progressPct} className="h-2 bg-muted" />
        </div>

        {/* Mark complete button */}
        {!isCompleted && allChecked && (
          <Button
            onClick={handleMarkComplete}
            className="w-full bg-lime font-semibold text-primary-foreground shadow-lime hover:bg-lime/90"
            data-ocid={`exercise.confirm_button.${index + 1}`}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as Complete
          </Button>
        )}
        {isCompleted && (
          <div className="flex items-center justify-center gap-2 rounded-lg border border-lime/30 bg-lime/10 py-2.5 text-sm font-semibold text-lime">
            <CheckCircle2 className="h-4 w-4" />
            Exercise Complete!
          </div>
        )}
      </div>
    </motion.div>
  );
}
