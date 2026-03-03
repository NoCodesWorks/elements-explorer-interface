import { Slider } from "@/components/ui/slider";
import { Thermometer } from "lucide-react";

interface TemperatureSliderProps {
  temperature: number;
  onChange: (temp: number) => void;
}

export function TemperatureSlider({ temperature, onChange }: TemperatureSliderProps) {
  const celsius = (temperature - 273.15).toFixed(0);

  return (
    <div className="flex items-center gap-3 w-full max-w-md">
      <Thermometer size={18} className="text-muted-foreground shrink-0" />
      <Slider
        min={0}
        max={6000}
        step={10}
        value={[temperature]}
        onValueChange={([v]) => onChange(v)}
        className="flex-1"
      />
      <div className="text-xs font-mono-code text-foreground whitespace-nowrap w-28 text-right">
        {temperature} K / {celsius} °C
      </div>
    </div>
  );
}
