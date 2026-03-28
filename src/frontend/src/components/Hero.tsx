import { CalendarDays } from "lucide-react";
import { motion } from "motion/react";

export function Hero({ isComplete }: { isComplete: boolean }) {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.10 0.008 250) 0%, oklch(0.14 0.01 235) 40%, oklch(0.12 0.012 220) 100%)",
        minHeight: "320px",
      }}
    >
      {/* Abstract gym grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 40px, oklch(0.88 0.22 128) 40px, oklch(0.88 0.22 128) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, oklch(0.88 0.22 128) 40px, oklch(0.88 0.22 128) 41px)",
        }}
      />
      {/* Lime gradient accent */}
      <div
        className="absolute inset-y-0 right-0 w-1/3 opacity-10"
        style={{
          background:
            "radial-gradient(ellipse at right center, oklch(0.88 0.22 128), transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex max-w-7xl flex-col justify-end px-4 py-12 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="mb-3 flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-medium">{dateStr}</span>
          </div>
          <h1 className="mb-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Daily Routine
          </h1>
          <p className="mb-2 text-lg font-medium text-muted-foreground">
            Full Body Strength &amp; Conditioning
          </p>
          <p className="text-sm text-muted-foreground">
            by <span className="font-semibold text-lime">Coach Sarah</span>
          </p>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-lime/20 px-4 py-2 text-sm font-semibold text-lime"
            >
              ✓ Workout Complete!
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
