import { Link } from "react-router-dom";
import { Thermometer, Atom, Box, FlaskConical, ArrowRight, ChevronRight } from "lucide-react";

const features = [
  {
    icon: Thermometer,
    title: "Temperature-Aware Phases",
    desc: "Watch elements transition between solid, liquid, and gas states in real time as you adjust temperature.",
  },
  {
    icon: Atom,
    title: "Electron Configurations",
    desc: "Explore detailed electron shell diagrams and subshell configurations for every element.",
  },
  {
    icon: Box,
    title: "Crystal Structures",
    desc: "Visualize 3D crystal structures and lattice parameters with interactive viewers.",
  },
  {
    icon: FlaskConical,
    title: "Binary Phase Diagrams",
    desc: "Simulate alloy systems with multi-tier CALPHAD, ML, and backend-driven phase prediction.",
  },
];

const workflowSteps = [
  { label: "Open Explorer", sub: "Launch the interactive table" },
  { label: "Select Element", sub: "Click any of 118 elements" },
  { label: "Explore Properties", sub: "Configs, structures & more" },
  { label: "Simulate Alloys", sub: "Binary phase diagrams" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-24 pb-20 overflow-hidden">
        {/* Subtle glow behind title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

        <span className="text-xs font-mono-code tracking-widest uppercase text-primary mb-4">
          Built for Scientists &amp; Students
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl leading-tight">
          Interactive Periodic Table{" "}
          <span className="text-primary">Explorer</span>
        </h1>
        <p className="mt-6 text-muted-foreground max-w-xl text-base sm:text-lg leading-relaxed">
          A visual, temperature-aware periodic table that shows real-time phase
          states, electron configurations, crystal structures, and binary phase
          diagrams — all in one elegant interface.
        </p>

        <Link
          to="/explore"
          className="mt-10 inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm transition-all hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:scale-105"
        >
          Explore the Elements
          <ArrowRight size={18} />
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-center text-2xl font-bold mb-10">Key Capabilities</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-6 flex gap-4 hover:border-primary/40 transition-colors"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <f.icon size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-center text-2xl font-bold mb-10">How It Works</h2>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          {workflowSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-2">
              <div className="flex flex-col items-center text-center w-36">
                <div className="w-12 h-12 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center text-primary font-bold font-mono-code text-sm mb-2">
                  {i + 1}
                </div>
                <span className="text-sm font-semibold">{step.label}</span>
                <span className="text-[0.65rem] text-muted-foreground mt-0.5">{step.sub}</span>
              </div>
              {i < workflowSteps.length - 1 && (
                <ChevronRight size={18} className="text-muted-foreground hidden sm:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center px-6 py-16 border-t border-border">
        <p className="text-muted-foreground text-sm mb-4">
          Ready to explore all 118 elements?
        </p>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors"
        >
          Launch Periodic Table
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

export default Landing;
