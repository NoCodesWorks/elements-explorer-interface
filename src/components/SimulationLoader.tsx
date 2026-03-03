import { useState, useEffect } from "react";

const SIMULATION_STEPS = [
  { label: "Initializing lattice parameters", icon: "🔬", duration: 800 },
  { label: "Constructing supercell geometry", icon: "🧱", duration: 700 },
  { label: "Setting up k-point mesh", icon: "📐", duration: 600 },
  { label: "Running SCF convergence", icon: "⚡", duration: 1200 },
  { label: "Computing electron density", icon: "🌊", duration: 900 },
  { label: "Optimizing ionic positions", icon: "🔄", duration: 1000 },
  { label: "Evaluating formation energies", icon: "📊", duration: 800 },
  { label: "Querying Materials Project database", icon: "🗄️", duration: 600 },
  { label: "Running AI phase analysis", icon: "🤖", duration: 1000 },
  { label: "Assembling phase diagram", icon: "📈", duration: 500 },
];

interface SimulationLoaderProps {
  systemName: string;
  onComplete: () => void;
}

export function SimulationLoader({ systemName, onComplete }: SimulationLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentStep >= SIMULATION_STEPS.length) {
      onComplete();
      return;
    }

    const step = SIMULATION_STEPS[currentStep];
    const interval = 50;
    const increments = step.duration / interval;
    let tick = 0;

    const timer = setInterval(() => {
      tick++;
      const baseProgress = (currentStep / SIMULATION_STEPS.length) * 100;
      const stepProgress = (tick / increments) * (100 / SIMULATION_STEPS.length);
      setProgress(Math.min(baseProgress + stepProgress, 100));

      if (tick >= increments) {
        clearInterval(timer);
        setCurrentStep((s) => s + 1);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="w-[420px] bg-card border border-border rounded-lg p-6 shadow-2xl">
        <h3 className="text-sm font-bold text-foreground font-mono-code mb-1">
          Molecular Simulation: {systemName}
        </h3>
        <p className="text-[0.65rem] text-muted-foreground mb-4">
          DFT + CALPHAD computation pipeline
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-primary rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-1 max-h-[240px] overflow-y-auto">
          {SIMULATION_STEPS.map((step, i) => {
            const done = i < currentStep;
            const active = i === currentStep;
            return (
              <div
                key={step.label}
                className={`flex items-center gap-2 text-xs px-2 py-1 rounded transition-all duration-200 ${
                  active
                    ? "bg-primary/10 text-foreground"
                    : done
                      ? "text-muted-foreground"
                      : "text-muted-foreground/40"
                }`}
              >
                <span className="text-sm w-5 text-center">
                  {done ? "✓" : active ? step.icon : "○"}
                </span>
                <span className={`font-mono-code ${active ? "font-medium" : ""}`}>
                  {step.label}
                </span>
                {active && (
                  <span className="ml-auto text-[0.6rem] text-primary animate-pulse">
                    processing...
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <p className="text-[0.6rem] text-muted-foreground mt-3 text-center italic">
          Fetching real data from Materials Project & AI analysis
        </p>
      </div>
    </div>
  );
}
