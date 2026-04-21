import { Label } from '@coston/ui/label';
import { Badge } from '@coston/ui/badge';

interface RadiusInputProps {
  radius: number;
  onChange: (radius: number) => void;
}

const RADIUS_PRESETS = [
  { value: 0, label: 'None', description: 'Sharp corners' },
  { value: 0.25, label: 'Small', description: 'Subtle rounding' },
  { value: 0.5, label: 'Medium', description: 'Balanced look' },
  { value: 0.75, label: 'Large', description: 'Friendly, soft' },
  { value: 1.0, label: 'Extra Large', description: 'Very rounded' },
];

export function RadiusInput({ radius, onChange }: RadiusInputProps) {
  const currentPreset = RADIUS_PRESETS.reduce((prev, curr) =>
    Math.abs(curr.value - radius) < Math.abs(prev.value - radius) ? curr : prev
  );

  return (
    <div className="space-y-4">
      {/* Current Value Display */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">Border Radius</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {currentPreset.label} - {currentPreset.description}
          </p>
        </div>
        <Badge variant="secondary" className="font-mono">
          {radius.toFixed(2)}rem
        </Badge>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={radius}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-primary
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-primary
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-pointer"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Sharp</span>
          <span>Rounded</span>
        </div>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-5 gap-2">
        {RADIUS_PRESETS.map(preset => (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            className={`
              px-2 py-1.5 text-xs rounded-md border transition-colors
              ${
                Math.abs(radius - preset.value) < 0.01
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted border-border'
              }
            `}
          >
            {preset.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Visual Preview */}
      <div className="grid grid-cols-5 gap-2 pt-2">
        {RADIUS_PRESETS.map(preset => (
          <div
            key={preset.value}
            className="aspect-square bg-primary"
            style={{ borderRadius: `${preset.value}rem` }}
          />
        ))}
      </div>
    </div>
  );
}
