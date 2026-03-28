import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  type WorkoutDay = {
    exercises : [Exercise];
    isComplete : Bool;
    completionTimestamp : ?Time.Time;
  };

  type WorkoutEntry = {
    user : Principal;
    workoutDay : ?WorkoutDay;
  };

  type ScheduledWorkout = {
    date : Text;
    workoutDay : WorkoutDay;
  };

  type ScheduledWorkouts = {
    principal : Principal;
    workouts : [ScheduledWorkout];
  };

  module Exercise {
    public func compare(exercise1 : Exercise, exercise2 : Exercise) : Order.Order {
      Text.compare(exercise1.name, exercise2.name);
    };
  };

  module WorkoutEntry {
    public func compareByUser(workoutEntry1 : WorkoutEntry, workoutEntry2 : WorkoutEntry) : Order.Order {
      Principal.compare(workoutEntry1.user, workoutEntry2.user);
    };
  };

  module ScheduledWorkout {
    public func compareByDate(a : ScheduledWorkout, b : ScheduledWorkout) : Order.Order {
      Text.compare(a.date, b.date);
    };
  };

  public type Exercise = {
    name : Text;
    category : Text;
    videoUrl : Text;
    sets : Nat;
    reps : Nat;
    description : Text;
  };

  public type SetLog = {
    exerciseName : Text;
    reps : Nat;
    weight : Float;
  };

  public type DayLog = {
    date : Text;
    isComplete : Bool;
  };

  public type WeeklyLog = {
    user : Principal;
    days : [DayLog];
  };

  public type UserProfile = {
    name : Text;
  };

  let workoutDays = Map.empty<Principal, WorkoutDay>();
  let setLogs = Map.empty<Principal, [SetLog]>();
  let weeklyLogs = Map.empty<Principal, WeeklyLog>();
  let scheduledWorkouts = Map.empty<Principal, [ScheduledWorkout]>();

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management (Required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Admin-only: Add workout day for a specific user
  public shared ({ caller }) func addWorkoutDay(user : Principal, workoutDay : WorkoutDay) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add workout days");
    };
    workoutDays.add(user, workoutDay);
  };

  // User logs their own set
  public shared ({ caller }) func logSet(setLog : SetLog) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log sets");
    };
    let existingLogs = switch (setLogs.get(caller)) {
      case (null) { [] };
      case (?logs) { logs };
    };
    setLogs.add(caller, existingLogs.concat([setLog]));
  };

  // User logs their own workout day
  public shared ({ caller }) func logWorkoutDay(date : Text, isComplete : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can log workout days");
    };
    let dayLog : DayLog = { date; isComplete };

    let weeklyLog = switch (weeklyLogs.get(caller)) {
      case (null) {
        { user = caller; days = [dayLog] };
      };
      case (?log) {
        let updatedDays = log.days.filter(func(d) { d.date != date }).concat([dayLog]);
        { log with days = updatedDays };
      };
    };

    weeklyLogs.add(caller, weeklyLog);
  };

  // User can view their own workout day, admin can view any
  public query ({ caller }) func getWorkoutDay() : async ?WorkoutDay {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view workout days");
    };
    workoutDays.get(caller);
  };

  // User can only view their own set logs
  public query ({ caller }) func getSetLogs() : async [SetLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view set logs");
    };
    switch (setLogs.get(caller)) {
      case (null) { [] };
      case (?logs) { logs };
    };
  };

  // User completes their own workout day
  public shared ({ caller }) func completeWorkoutDay() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete workout days");
    };
    switch (workoutDays.get(caller)) {
      case (null) { Runtime.trap("Workout day not found") };
      case (?workoutDay) {
        let updatedWorkoutDay = {
          workoutDay with
          isComplete = true;
          completionTimestamp = ?Time.now();
        };
        workoutDays.add(caller, updatedWorkoutDay);
      };
    };
  };

  // User can view their own weekly log, admin can view any
  public query ({ caller }) func getWeeklyLog() : async WeeklyLog {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view weekly logs");
    };
    switch (weeklyLogs.get(caller)) {
      case (null) {
        {
          user = caller;
          days = [];
        };
      };
      case (?log) { log };
    };
  };

  // Admin-only: View all workouts across all users
  public query ({ caller }) func getAllWorkouts() : async [WorkoutEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all workouts");
    };
    workoutDays.toArray().map(
      func((principal, workoutDay)) {
        {
          user = principal;
          workoutDay = ?workoutDay;
        };
      }
    ).sort(WorkoutEntry.compareByUser);
  };

  // Public: Anyone can view exercise definitions (seed data)
  public query ({ caller }) func getAllExercises() : async [Exercise] {
    let fullBodyExercises = List.empty<Exercise>();

    fullBodyExercises.add({
      name = "Squats";
      category = "Lower Body";
      videoUrl = "https://www.youtube.com/watch?v=aclHkVaku9U";
      sets = 3;
      reps = 15;
      description = "A fundamental lower body exercise that targets the quads, glutes, and core. Stand with feet shoulder-width apart, lower your body by bending your knees and hips, keeping your back straight, then return to standing position.";
    });

    fullBodyExercises.add({
      name = "Deadlifts";
      category = "Full Body";
      videoUrl = "https://www.youtube.com/watch?v=ytGaGIn3SjE";
      sets = 3;
      reps = 12;
      description = "A compound exercise that targets the hamstrings, glutes, lower back, and upper back. Stand with feet shoulder-width apart, bend your knees and hips to lower and grab the bar, keeping back straight, then lift the bar by extending hips and knees.";
    });

    fullBodyExercises.add({
      name = "Dumbbell Bench Press";
      category = "Upper Body";
      videoUrl = "https://www.youtube.com/watch?v=VmB1G1K7v94";
      sets = 3;
      reps = 12;
      description = "Targets the chest, shoulders, and triceps. Lie on a flat bench, hold dumbbells at shoulder level, press up until arms are extended, then lower back down.";
    });

    fullBodyExercises.add({
      name = "Plank";
      category = "Core";
      videoUrl = "https://www.youtube.com/watch?v=pSHjTRCQxIw";
      sets = 3;
      reps = 30; // 30 seconds
      description = "Strengthens the core, shoulders, and glutes. Hold a straight position with elbows under shoulders, body in a straight line from head to heels.";
    });

    fullBodyExercises.toArray().sort();
  };

  // Public: Anyone can view exercise by name (seed data)
  public query ({ caller }) func getExerciseByName(name : Text) : async Exercise {
    let allExercises = List.empty<Exercise>();

    allExercises.add({
      name = "Squats";
      category = "Lower Body";
      videoUrl = "https://www.youtube.com/watch?v=aclHkVaku9U";
      sets = 3;
      reps = 15;
      description = "A fundamental lower body exercise that targets the quads, glutes, and core. Stand with feet shoulder-width apart, lower your body by bending your knees and hips, keeping your back straight, then return to standing position.";
    });

    allExercises.add({
      name = "Deadlifts";
      category = "Full Body";
      videoUrl = "https://www.youtube.com/watch?v=ytGaGIn3SjE";
      sets = 3;
      reps = 12;
      description = "A compound exercise that targets the hamstrings, glutes, lower back, and upper back. Stand with feet shoulder-width apart, bend your knees and hips to lower and grab the bar, keeping back straight, then lift the bar by extending hips and knees.";
    });

    allExercises.add({
      name = "Dumbbell Bench Press";
      category = "Upper Body";
      videoUrl = "https://www.youtube.com/watch?v=VmB1G1K7v94";
      sets = 3;
      reps = 12;
      description = "Targets the chest, shoulders, and triceps. Lie on a flat bench, hold dumbbells at shoulder level, press up until arms are extended, then lower back down.";
    });

    allExercises.add({
      name = "Plank";
      category = "Core";
      videoUrl = "https://www.youtube.com/watch?v=pSHjTRCQxIw";
      sets = 3;
      reps = 30; // 30 seconds
      description = "Strengthens the core, shoulders, and glutes. Hold a straight position with elbows under shoulders, body in a straight line from head to heels.";
    });

    switch (allExercises.toArray().find(func(exercise) { Text.equal(exercise.name, name) })) {
      case (null) { Runtime.trap("Exercise not found") };
      case (?exercise) { exercise };
    };
  };

  // Admin-only: View all weekly logs across all users
  public query ({ caller }) func getAllWeeklyLogs() : async [WeeklyLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all weekly logs");
    };
    weeklyLogs.values().toArray();
  };

  // -------------------------------------------------------------------------------------------------
  //                                                    NEW CODE!
  // -------------------------------------------------------------------------------------------------

  // Schedule a workout day for a user (admin only)
  public shared ({ caller }) func scheduleWorkoutDay(user : Principal, date : Text, workoutDay : WorkoutDay) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can schedule workouts");
    };

    let newWorkout : ScheduledWorkout = {
      date;
      workoutDay;
    };

    let existingWorkouts = switch (scheduledWorkouts.get(user)) {
      case (?workouts) {
        let filtered = workouts.filter(func(workout) { workout.date != date });
        filtered.concat([newWorkout]);
      };
      case (null) { [newWorkout] };
    };

    scheduledWorkouts.add(user, existingWorkouts);
  };

  // Get all scheduled workouts for the current user
  public query ({ caller }) func getScheduledWorkouts() : async [ScheduledWorkout] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view scheduled workouts");
    };
    switch (scheduledWorkouts.get(caller)) {
      case (?workouts) { workouts.sort(ScheduledWorkout.compareByDate) };
      case (null) { [] };
    };
  };

  // Get the workout for the current user on a specific date
  public query ({ caller }) func getWorkoutDayByDate(date : Text) : async ?WorkoutDay {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get workout day by date");
    };
    switch (scheduledWorkouts.get(caller)) {
      case (?workouts) {
        switch (workouts.find(func(workout) { workout.date == date })) {
          case (null) { null };
          case (?workout) { ?workout.workoutDay };
        };
      };
      case (null) { null };
    };
  };
};
