import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SimulationResult } from "@/components/BinaryPhaseDiagram";

type SimStatus = "idle" | "fetching" | "simulating";

interface ComputeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elementA: { number: number; symbol: string; name: string };
  elementB: { number: number; symbol: string; name: string };
  onResult: (result: SimulationResult) => void;
}

const DFT_FUNCTIONALS = [
  { value: "PBE", label: "PBE (Perdew-Burke-Ernzerhof)" },
  { value: "PBEsol", label: "PBEsol (revised PBE for solids)" },
  { value: "SCAN", label: "SCAN (Strongly Constrained)" },
  { value: "r2SCAN", label: "r2SCAN (regularized SCAN)" },
];

export function ComputeModal({ open, onOpenChange, elementA, elementB, onResult }: ComputeModalProps) {
  const [tempRange, setTempRange] = useState([300, 2500]);
  const [functional, setFunctional] = useState("PBE");
  const [status, setStatus] = useState<SimStatus>("idle");

  const statusColors: Record<SimStatus, string> = {
    idle: "bg-muted",
    fetching: "bg-blue-500",
    simulating: "bg-orange-500",
  };

  const statusLabels: Record<SimStatus, string> = {
    idle: "Idle",
    fetching: "API Fetching…",
    simulating: "Active Simulation…",
  };

  const handleCompute = async () => {
    setStatus("fetching");
    try {
      const { data, error } = await supabase.functions.invoke("binary-simulation", {
        body: {
          elementA: elementA.number,
          elementB: elementB.number,
          symbolA: elementA.symbol,
          symbolB: elementB.symbol,
          tempMin: tempRange[0],
          tempMax: tempRange[1],
          functional,
        },
      });

      setStatus("simulating");

      // Small delay to show simulating state
      await new Promise((r) => setTimeout(r, 1500));

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        onResult(data as SimulationResult);
        toast.success("Computation complete");
      }
    } catch (err: any) {
      toast.error(`Computation failed: ${err.message}`);
    } finally {
      setStatus("idle");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-mono-code">
            Compute: {elementA.symbol}–{elementB.symbol}
          </DialogTitle>
          <DialogDescription>
            No pre-computed CALPHAD data available. Configure simulation parameters below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${statusColors[status]} ${
                status !== "idle" ? "animate-pulse" : ""
              }`}
            />
            <span className="text-xs text-muted-foreground">{statusLabels[status]}</span>
          </div>

          {/* MD Temperature Range */}
          <div className="space-y-2">
            <Label className="text-xs">MD Temperature Range (K)</Label>
            <Slider
              min={100}
              max={5000}
              step={50}
              value={tempRange}
              onValueChange={setTempRange}
              className="w-full"
            />
            <div className="flex justify-between text-[0.65rem] text-muted-foreground font-mono-code">
              <span>{tempRange[0]} K</span>
              <span>{tempRange[1]} K</span>
            </div>
          </div>

          {/* DFT Functional */}
          <div className="space-y-2">
            <Label className="text-xs">DFT Functional</Label>
            <Select value={functional} onValueChange={setFunctional}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DFT_FUNCTIONALS.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="text-xs">
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleCompute} disabled={status !== "idle"}>
            {status !== "idle" ? "Computing…" : "Run Computation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
