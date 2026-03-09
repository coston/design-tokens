import './style.css';

// JS import from npm — no /dist/ path needed
import { generateThemeFromColor } from '@coston/design-tokens';

// --- Color swatches ---

const TOKEN_VARS = [
  { name: 'primary', label: 'Primary' },
  { name: 'primary-foreground', label: 'Primary FG' },
  { name: 'secondary', label: 'Secondary' },
  { name: 'secondary-foreground', label: 'Secondary FG' },
  { name: 'accent', label: 'Accent' },
  { name: 'muted', label: 'Muted' },
  { name: 'muted-foreground', label: 'Muted FG' },
  { name: 'destructive', label: 'Destructive' },
  { name: 'background', label: 'Background' },
  { name: 'foreground', label: 'Foreground' },
  { name: 'card', label: 'Card' },
  { name: 'border', label: 'Border' },
];

function buildSwatches() {
  const container = document.getElementById('swatches')!;
  const fragment = document.createDocumentFragment();

  TOKEN_VARS.forEach(({ name, label }) => {
    const el = document.createElement('div');
    el.className = 'swatch';
    el.innerHTML = `
      <div class="swatch-color" style="background:var(--${name})"></div>
      <div class="swatch-label">
        <strong>${label}</strong>
        <span>--${name}</span>
      </div>
    `;
    fragment.appendChild(el);
  });

  container.appendChild(fragment);
}

// --- Theme generation ---

function buildThemeOutput() {
  const statusEl = document.getElementById('theme-status')!;
  const outputEl = document.getElementById('theme-output')!;

  try {
    const theme = generateThemeFromColor({ baseColor: 'oklch(0.6 0.18 240)' });
    const lightVars = Object.entries(theme.light);

    statusEl.textContent = `generateThemeFromColor() returned ${lightVars.length} light-mode tokens.`;

    const grid = document.createElement('div');
    grid.className = 'theme-vars';
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < Math.min(18, lightVars.length); i++) {
      const [key, value] = lightVars[i];
      const item = document.createElement('div');
      item.className = 'theme-var';
      item.innerHTML = `
        <div class="theme-var-dot" style="background:${value}"></div>
        <span>${key}: ${value}</span>
      `;
      fragment.appendChild(item);
    }

    grid.appendChild(fragment);
    outputEl.appendChild(grid);
  } catch (err) {
    statusEl.textContent = `Error: ${err}`;
  }
}

buildSwatches();
buildThemeOutput();
