import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Principal } from "@icp-sdk/core/principal";
import {
  CalendarDays,
  CheckCircle2,
  CirclePlus,
  Dumbbell,
  Loader2,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddWorkoutDay,
  useAllWorkouts,
  useScheduleWorkoutDay,
} from "../hooks/useQueries";

interface ExerciseData {
  name: string;
  category: string;
  sets: number;
  reps: number;
  videoUrl: string;
  description: string;
}

interface ExerciseRow extends ExerciseData {
  id: number;
}

const CATEGORIES = ["Lower Body", "Upper Body", "Full Body", "Core", "Cardio"];

const PRESET_EXERCISES: ExerciseData[] = [
  {
    name: "Squats",
    category: "Lower Body",
    sets: 3,
    reps: 15,
    videoUrl: "https://www.youtube.com/watch?v=aclHkVaku9U",
    description:
      "Stand feet shoulder-width, lower by bending knees/hips, keep back straight, return to standing.",
  },
  {
    name: "Deadlifts",
    category: "Full Body",
    sets: 3,
    reps: 12,
    videoUrl: "https://www.youtube.com/watch?v=ytGaGIn3SjE",
    description:
      "Bend to grab bar, back straight, lift by extending hips and knees.",
  },
  {
    name: "Bench Press",
    category: "Upper Body",
    sets: 3,
    reps: 12,
    videoUrl: "https://www.youtube.com/watch?v=VmB1G1K7v94",
    description:
      "Lie on bench, press dumbbells up from shoulder level, lower back down.",
  },
  {
    name: "Shoulder Press",
    category: "Upper Body",
    sets: 3,
    reps: 12,
    videoUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
    description:
      "Press dumbbells overhead from shoulder height, lower back down.",
  },
  {
    name: "Pull-ups",
    category: "Upper Body",
    sets: 3,
    reps: 10,
    videoUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    description:
      "Hang from bar, pull chest to bar by driving elbows down, lower slowly.",
  },
  {
    name: "Plank",
    category: "Core",
    sets: 3,
    reps: 30,
    videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    description:
      "Hold straight position, elbows under shoulders, body in a line from head to heels.",
  },
  {
    name: "Lunges",
    category: "Lower Body",
    sets: 3,
    reps: 12,
    videoUrl: "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
    description:
      "Step forward, lower back knee toward floor, push back to starting position.",
  },
  {
    name: "Bicep Curls",
    category: "Upper Body",
    sets: 3,
    reps: 12,
    videoUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
    description: "Hold dumbbells at sides, curl up to shoulders, lower slowly.",
  },
  {
    name: "Tricep Dips",
    category: "Upper Body",
    sets: 3,
    reps: 12,
    videoUrl: "https://www.youtube.com/watch?v=0326dy_-CzM",
    description: "Lower body by bending elbows behind you, press back up.",
  },
  {
    name: "Cable Rows",
    category: "Full Body",
    sets: 3,
    reps: 12,
    videoUrl: "https://www.youtube.com/watch?v=GZbfZ033f74",
    description: "Pull cable to torso, squeeze shoulder blades, slowly return.",
  },
];

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    "Lower Body": "bg-blue-500/15 text-blue-400",
    "Upper Body": "bg-purple-500/15 text-purple-400",
    "Full Body": "bg-lime/15 text-lime",
    Core: "bg-orange-500/15 text-orange-400",
    Cardio: "bg-red-500/15 text-red-400",
  };
  return map[cat] ?? "bg-muted text-muted-foreground";
}

export function AdminPanel() {
  const [principalInput, setPrincipalInput] = useState("");
  const [principalError, setPrincipalError] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const idRef = useRef(0);

  function makeRow(data: ExerciseData): ExerciseRow {
    return { ...data, id: ++idRef.current };
  }

  const [exercises, setExercises] = useState<ExerciseRow[]>(() => [
    makeRow({
      name: "",
      category: "Full Body",
      sets: 3,
      reps: 12,
      videoUrl: "",
      description: "",
    }),
  ]);

  const { data: allWorkouts, isLoading: loadingWorkouts } = useAllWorkouts();
  const { mutate: addWorkoutDay, isPending: pendingAdd } = useAddWorkoutDay();
  const { mutate: scheduleWorkoutDay, isPending: pendingSchedule } =
    useScheduleWorkoutDay();

  const isPending = pendingAdd || pendingSchedule;

  function addExercise() {
    setExercises((prev) => [
      ...prev,
      makeRow({
        name: "",
        category: "Full Body",
        sets: 3,
        reps: 12,
        videoUrl: "",
        description: "",
      }),
    ]);
  }

  function removeExercise(id: number) {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  }

  function updateExercise(
    id: number,
    field: keyof ExerciseData,
    value: string | number,
  ) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)),
    );
  }

  function applyPreset(preset: ExerciseData, id: number) {
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, ...preset } : ex)),
    );
  }

  function handleAddPreset(preset: ExerciseData) {
    setExercises((prev) => [...prev, makeRow({ ...preset })]);
  }

  function resetForm() {
    setPrincipalInput("");
    setScheduleDate("");
    setExercises([
      makeRow({
        name: "",
        category: "Full Body",
        sets: 3,
        reps: 12,
        videoUrl: "",
        description: "",
      }),
    ]);
  }

  function buildWorkoutDay(filled: ExerciseRow[]) {
    return {
      exercises: filled.map((e) => ({
        name: e.name,
        category: e.category,
        sets: BigInt(e.sets),
        reps: BigInt(e.reps),
        videoUrl: e.videoUrl,
        description: e.description,
      })),
      isComplete: false,
      completionTimestamp: undefined,
    };
  }

  function handleAssignToday() {
    setPrincipalError("");
    if (!principalInput.trim()) {
      setPrincipalError("Principal ID is required");
      return;
    }
    let user: Principal;
    try {
      user = Principal.fromText(principalInput.trim());
    } catch {
      setPrincipalError("Invalid Principal ID format");
      return;
    }
    const filled = exercises.filter((e) => e.name.trim().length > 0);
    if (filled.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }
    addWorkoutDay(
      { user, workoutDay: buildWorkoutDay(filled) },
      {
        onSuccess: () => {
          toast.success("Workout assigned for today!");
          resetForm();
        },
        onError: () => toast.error("Failed to assign workout"),
      },
    );
  }

  function handleScheduleForDate() {
    setPrincipalError("");
    if (!principalInput.trim()) {
      setPrincipalError("Principal ID is required");
      return;
    }
    if (!scheduleDate) {
      toast.error("Please select a schedule date");
      return;
    }
    let user: Principal;
    try {
      user = Principal.fromText(principalInput.trim());
    } catch {
      setPrincipalError("Invalid Principal ID format");
      return;
    }
    const filled = exercises.filter((e) => e.name.trim().length > 0);
    if (filled.length === 0) {
      toast.error("Add at least one exercise");
      return;
    }
    scheduleWorkoutDay(
      { user, date: scheduleDate, workoutDay: buildWorkoutDay(filled) },
      {
        onSuccess: () => {
          toast.success(`Workout scheduled for ${scheduleDate}!`);
          resetForm();
        },
        onError: () => toast.error("Failed to schedule workout"),
      },
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-10"
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-lime">
            <Dumbbell className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Admin Panel
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and assign workouts to gym members
            </p>
          </div>
        </div>

        {/* Assign Workout Section */}
        <section
          className="rounded-2xl border border-border bg-card p-6"
          data-ocid="admin.panel"
        >
          <div className="mb-6 flex items-center gap-2">
            <Zap className="h-5 w-5 text-lime" />
            <h2 className="font-display text-xl font-bold text-foreground">
              Assign Workout to User
            </h2>
          </div>

          {/* Principal Input */}
          <div className="mb-4 max-w-lg">
            <Label
              htmlFor="principal-input"
              className="mb-1.5 block text-sm font-medium text-foreground"
            >
              User Principal ID
            </Label>
            <Input
              id="principal-input"
              value={principalInput}
              onChange={(e) => {
                setPrincipalInput(e.target.value);
                setPrincipalError("");
              }}
              placeholder="e.g. 2vxsx-fae"
              className="border-border bg-background font-mono text-sm"
              data-ocid="admin.input"
            />
            {principalError && (
              <p
                className="mt-1.5 text-xs text-destructive"
                data-ocid="admin.error_state"
              >
                {principalError}
              </p>
            )}
          </div>

          {/* Schedule Date */}
          <div className="mb-6 max-w-lg">
            <Label
              htmlFor="schedule-date"
              className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground"
            >
              <CalendarDays className="h-3.5 w-3.5 text-lime" />
              Schedule Date
              <span className="text-xs font-normal text-muted-foreground">
                (optional — leave blank to assign for today)
              </span>
            </Label>
            <Input
              id="schedule-date"
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="border-border bg-background text-sm w-52"
              data-ocid="admin.input"
            />
          </div>

          {/* Preset library */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-semibold text-foreground">
              Quick-Add Presets
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_EXERCISES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-lime/50 hover:bg-lime/10 hover:text-lime"
                  data-ocid="admin.secondary_button"
                >
                  <CirclePlus className="h-3.5 w-3.5" />
                  {preset.name}
                  <Badge
                    className={`ml-0.5 border-none px-1.5 py-0 text-[10px] ${categoryColor(preset.category)}`}
                  >
                    {preset.category}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <Separator className="mb-6 bg-border" />

          {/* Exercise builder */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">
              Exercises ({exercises.filter((e) => e.name.trim()).length} added)
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExercise}
              className="border-lime/40 text-lime hover:bg-lime/10 hover:text-lime"
              data-ocid="admin.primary_button"
            >
              <CirclePlus className="mr-1.5 h-4 w-4" />
              Add Exercise
            </Button>
          </div>

          <div className="space-y-4">
            {exercises.map((ex, i) => (
              <motion.div
                key={ex.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border border-border bg-background p-4"
                data-ocid={`admin.item.${i + 1}`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Exercise {i + 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Select
                      onValueChange={(val) => {
                        const preset = PRESET_EXERCISES.find(
                          (p) => p.name === val,
                        );
                        if (preset) applyPreset(preset, ex.id);
                      }}
                    >
                      <SelectTrigger
                        className="h-7 w-40 border-border bg-secondary/60 text-xs"
                        data-ocid="admin.select"
                      >
                        <SelectValue placeholder="Load preset…" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRESET_EXERCISES.map((p) => (
                          <SelectItem
                            key={p.name}
                            value={p.name}
                            className="text-xs"
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {exercises.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.id)}
                        className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        data-ocid={`admin.delete_button.${i + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="mb-1 block text-xs text-muted-foreground">
                      Exercise Name
                    </Label>
                    <Input
                      value={ex.name}
                      onChange={(e) =>
                        updateExercise(ex.id, "name", e.target.value)
                      }
                      placeholder="e.g. Squats"
                      className="h-9 border-border bg-muted/50 text-sm"
                      data-ocid="admin.input"
                    />
                  </div>

                  <div>
                    <Label className="mb-1 block text-xs text-muted-foreground">
                      Category
                    </Label>
                    <Select
                      value={ex.category}
                      onValueChange={(val) =>
                        updateExercise(ex.id, "category", val)
                      }
                    >
                      <SelectTrigger
                        className="h-9 border-border bg-muted/50 text-sm"
                        data-ocid="admin.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-1 block text-xs text-muted-foreground">
                      Sets
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={ex.sets}
                      onChange={(e) =>
                        updateExercise(ex.id, "sets", Number(e.target.value))
                      }
                      className="h-9 border-border bg-muted/50 text-sm"
                      data-ocid="admin.input"
                    />
                  </div>

                  <div>
                    <Label className="mb-1 block text-xs text-muted-foreground">
                      Reps
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={ex.reps}
                      onChange={(e) =>
                        updateExercise(ex.id, "reps", Number(e.target.value))
                      }
                      className="h-9 border-border bg-muted/50 text-sm"
                      data-ocid="admin.input"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="mb-1 block text-xs text-muted-foreground">
                      YouTube Video URL
                    </Label>
                    <Input
                      value={ex.videoUrl}
                      onChange={(e) =>
                        updateExercise(ex.id, "videoUrl", e.target.value)
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="h-9 border-border bg-muted/50 text-sm"
                      data-ocid="admin.input"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="mb-1 block text-xs text-muted-foreground">
                      Description
                    </Label>
                    <Textarea
                      value={ex.description}
                      onChange={(e) =>
                        updateExercise(ex.id, "description", e.target.value)
                      }
                      placeholder="Describe proper form and technique…"
                      rows={2}
                      className="resize-none border-border bg-muted/50 text-sm"
                      data-ocid="admin.textarea"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={handleAssignToday}
              disabled={isPending}
              variant="outline"
              className="flex-1 border-lime/40 font-semibold text-lime hover:bg-lime/10 hover:text-lime h-11"
              data-ocid="admin.secondary_button"
            >
              {pendingAdd ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning…
                </>
              ) : (
                "Assign for Today"
              )}
            </Button>
            <Button
              onClick={handleScheduleForDate}
              disabled={isPending || !scheduleDate}
              className="flex-1 bg-lime font-semibold text-primary-foreground shadow-lime hover:bg-lime/90 h-11"
              data-ocid="admin.submit_button"
            >
              {pendingSchedule ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling…
                </>
              ) : (
                <>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Schedule for Date
                </>
              )}
            </Button>
          </div>
        </section>

        {/* All Workouts Table */}
        <section
          className="rounded-2xl border border-border bg-card p-6"
          data-ocid="admin.table"
        >
          <div className="mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-lime" />
            <h2 className="font-display text-xl font-bold text-foreground">
              All User Workouts
            </h2>
          </div>

          {loadingWorkouts ? (
            <div
              className="flex items-center justify-center py-12"
              data-ocid="admin.loading_state"
            >
              <Loader2 className="h-8 w-8 animate-spin text-lime" />
            </div>
          ) : !allWorkouts || allWorkouts.length === 0 ? (
            <div
              className="flex flex-col items-center gap-3 py-12 text-center"
              data-ocid="admin.empty_state"
            >
              <Dumbbell className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-muted-foreground">No workouts assigned yet.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-secondary/40 hover:bg-secondary/40">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      #
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      User Principal
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Exercises
                    </TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allWorkouts.map((entry, i) => {
                    const exerciseCount =
                      entry.workoutDay?.exercises.length ?? 0;
                    const isComplete = entry.workoutDay?.isComplete ?? false;
                    const principal = entry.user.toString();
                    const truncated =
                      principal.length > 20
                        ? `${principal.slice(0, 10)}…${principal.slice(-6)}`
                        : principal;
                    return (
                      <TableRow
                        key={principal}
                        className="border-border"
                        data-ocid={`admin.row.${i + 1}`}
                      >
                        <TableCell className="text-xs text-muted-foreground">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <code className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-foreground">
                            {truncated}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-foreground">
                            {exerciseCount} exercise
                            {exerciseCount !== 1 ? "s" : ""}
                          </span>
                        </TableCell>
                        <TableCell>
                          {isComplete ? (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-lime">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                              <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                              Pending
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </motion.div>
    </div>
  );
}
