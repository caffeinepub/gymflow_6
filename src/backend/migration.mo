import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  // Types from original actor.
  type WorkoutDay = {
    exercises : [Exercise];
    isComplete : Bool;
    completionTimestamp : ?Time.Time;
  };

  type Exercise = {
    name : Text;
    category : Text;
    videoUrl : Text;
    sets : Nat;
    reps : Nat;
    description : Text;
  };

  type SetLog = {
    exerciseName : Text;
    reps : Nat;
    weight : Float;
  };

  type DayLog = {
    date : Text;
    isComplete : Bool;
  };

  type WeeklyLog = {
    user : Principal.Principal;
    days : [DayLog];
  };

  type ScheduledWorkout = {
    date : Text;
    workoutDay : WorkoutDay;
  };

  type UserProfile = {
    name : Text;
  };

  type OldActor = {
    workoutDays : Map.Map<Principal.Principal, WorkoutDay>;
    setLogs : Map.Map<Principal.Principal, [SetLog]>;
    weeklyLogs : Map.Map<Principal.Principal, WeeklyLog>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
  };

  // Types from new actor.
  type NewActor = {
    workoutDays : Map.Map<Principal.Principal, WorkoutDay>;
    setLogs : Map.Map<Principal.Principal, [SetLog]>;
    weeklyLogs : Map.Map<Principal.Principal, WeeklyLog>;
    scheduledWorkouts : Map.Map<Principal.Principal, [ScheduledWorkout]>;
    userProfiles : Map.Map<Principal.Principal, UserProfile>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      scheduledWorkouts = Map.empty<Principal.Principal, [ScheduledWorkout]>();
      userProfiles = old.userProfiles;
    };
  };
};
