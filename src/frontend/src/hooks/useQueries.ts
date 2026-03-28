import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SetLog, WorkoutDay } from "../backend.d";
import { useActor } from "./useActor";

export function useWorkoutDay() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["workoutDay"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWorkoutDay();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetLogs() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["setLogs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSetLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWeeklyLog() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["weeklyLog"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWeeklyLog();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllWorkouts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allWorkouts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWorkouts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useScheduledWorkouts() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["scheduledWorkouts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getScheduledWorkouts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useWorkoutDayByDate(date: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["workoutDayByDate", date],
    queryFn: async () => {
      if (!actor || !date) return null;
      return actor.getWorkoutDayByDate(date);
    },
    enabled: !!actor && !isFetching && !!date,
  });
}

export function useAddWorkoutDay() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      workoutDay,
    }: { user: Principal; workoutDay: WorkoutDay }) => {
      if (!actor) throw new Error("No actor");
      return actor.addWorkoutDay(user, workoutDay);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allWorkouts"] }),
  });
}

export function useScheduleWorkoutDay() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      user,
      date,
      workoutDay,
    }: { user: Principal; date: string; workoutDay: WorkoutDay }) => {
      if (!actor) throw new Error("No actor");
      return actor.scheduleWorkoutDay(user, date, workoutDay);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allWorkouts"] });
      qc.invalidateQueries({ queryKey: ["scheduledWorkouts"] });
    },
  });
}

export function useLogSet() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (setLog: SetLog) => {
      if (!actor) throw new Error("No actor");
      return actor.logSet(setLog);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["setLogs"] }),
  });
}

export function useCompleteWorkout() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      const today = new Date().toISOString().split("T")[0];
      await actor.completeWorkoutDay();
      await actor.logWorkoutDay(today, true);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workoutDay"] });
      qc.invalidateQueries({ queryKey: ["weeklyLog"] });
    },
  });
}
