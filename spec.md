# GymFlow

## Current State
- App has a workout view with hardcoded exercises (Squats, Deadlifts, Dumbbell Bench Press, Plank)
- Backend supports `addWorkoutDay(user, workoutDay)` (admin-only) to assign exercises to a user
- No admin UI exists — workouts can only be assigned programmatically
- Exercise fields: name, category, videoUrl, sets, reps, description

## Requested Changes (Diff)

### Add
- Admin panel page/view accessible via a button in the header (only visible to admins)
- In admin panel:
  - Form to build a workout: add multiple exercises with all fields (name, category, sets, reps, videoUrl, description)
  - Assign the workout to a specific user (by their Principal ID)
  - Submit to call `addWorkoutDay`
  - List of existing workout assignments via `getAllWorkouts`
- Preset exercise library: quick-add buttons for common exercises to pre-fill the form

### Modify
- Header: show Admin button if `isCallerAdmin()` returns true

### Remove
- Nothing removed

## Implementation Plan
1. Add admin detection hook using `isCallerAdmin` query
2. Add Admin button in Header visible only to admins
3. Create AdminPanel.tsx with user Principal input, dynamic exercise list builder, preset quick-adds, submit via addWorkoutDay, and a table of all workout assignments
4. Wire admin panel toggle into App.tsx
