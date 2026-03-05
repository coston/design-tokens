import { Label } from '@/components/ui/label';
// Demo-specific imports (not part of public API)
import { toOKLCH, oklchToHex } from '@internal/color-utils';

interface ColorState {
  l: number;
  c: number;
  h: number;
}

interface ColorInputProps {
  color: ColorState;
  onChange: (color: ColorState) => void;
}

export function ColorInput({ color, onChange }: ColorInputProps) {
  const colorString = toOKLCH(color);
  // Browser handles out-of-gamut OKLCH colors natively
  const hexColor = oklchToHex(colorString);

  const handleChange = (component: 'l' | 'c' | 'h', value: number) => {
    onChange({
      ...color,
      [component]: value,
    });
  };

  return (
    <div className="space-y-6">
      {/* Color Preview Swatch */}
      <div className="space-y-2">
        <Label>Color Preview</Label>
        <div
          className="w-full h-32 rounded-lg border-2 border-border shadow-sm"
          style={{ backgroundColor: hexColor }}
        />
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="font-mono text-xs">{colorString}</div>
          <div className="font-mono text-xs">{hexColor}</div>
        </div>
      </div>

      {/* Lightness Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="lightness">
            Lightness
            <span className="ml-2 text-xs text-muted-foreground">
              (Brightness: 0 = black, 1 = white)
            </span>
          </Label>
          <span className="text-sm font-mono text-muted-foreground">{color.l.toFixed(2)}</span>
        </div>
        <input
          id="lightness"
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={color.l}
          onChange={e => handleChange('l', parseFloat(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Chroma Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="chroma">
            Chroma
            <span className="ml-2 text-xs text-muted-foreground">(Saturation/intensity)</span>
          </Label>
          <span className="text-sm font-mono text-muted-foreground">{color.c.toFixed(3)}</span>
        </div>
        <input
          id="chroma"
          type="range"
          min="0"
          max="0.4"
          step="0.01"
          value={color.c}
          onChange={e => handleChange('c', parseFloat(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
        />
      </div>

      {/* Hue Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="hue">
            Hue
            <span className="ml-2 text-xs text-muted-foreground">
              (Color around the wheel: 0° = red, 120° = green, 240° = blue)
            </span>
          </Label>
          <span className="text-sm font-mono text-muted-foreground">{Math.round(color.h)}°</span>
        </div>
        <input
          id="hue"
          type="range"
          min="0"
          max="360"
          step="1"
          value={color.h}
          onChange={e => handleChange('h', parseFloat(e.target.value))}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Red</span>
          <span>Yellow</span>
          <span>Green</span>
          <span>Cyan</span>
          <span>Blue</span>
          <span>Magenta</span>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid var(--background);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary);
          cursor: pointer;
          border: 2px solid var(--background);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px var(--ring);
        }

        .slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px var(--ring);
        }
      `}</style>
    </div>
  );
}
