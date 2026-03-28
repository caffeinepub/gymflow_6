import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Exercise {
    name: string;
    reps: bigint;
    sets: bigint;
    description: string;
    category: string;
    videoUrl: string;
}
export type Time = bigint;
export interface WeeklyLog {
    days: Array<DayLog>;
    user: Principal;
}
export interface DayLog {
    date: string;
    isComplete: boolean;
}
export interface ScheduledWorkout {
    date: string;
    workoutDay: WorkoutDay;
}
export interface SetLog {
    weight: number;
    reps: bigint;
    exerciseName: string;
}
export interface WorkoutEntry {
    user: Principal;
    workoutDay?: WorkoutDay;
}
export interface WorkoutDay {
    exercises: Array<Exercise>;
    completionTimestamp?: Time;
    isComplete: boolean;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addWorkoutDay(user: Principal, workoutDay: WorkoutDay): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeWorkoutDay(): Promise<void>;
    getAllExercises(): Promise<Array<Exercise>>;
    getAllWeeklyLogs(): Promise<Array<WeeklyLog>>;
    getAllWorkouts(): Promise<Array<WorkoutEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExerciseByName(name: string): Promise<Exercise>;
    getScheduledWorkouts(): Promise<Array<ScheduledWorkout>>;
    getSetLogs(): Promise<Array<SetLog>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklyLog(): Promise<WeeklyLog>;
    getWorkoutDay(): Promise<WorkoutDay | null>;
    getWorkoutDayByDate(date: string): Promise<WorkoutDay | null>;
    isCallerAdmin(): Promise<boolean>;
    logSet(setLog: SetLog): Promise<void>;
    logWorkoutDay(date: string, isComplete: boolean): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    scheduleWorkoutDay(user: Principal, date: string, workoutDay: WorkoutDay): Promise<void>;
}
