import { test } from '@playwright/test';

const routes = [
  { path: '/', name: 'dashboard' },
  { path: '/mail', name: 'mail' },
  { path: '/files', name: 'files' },
  { path: '/notifications', name: 'notifications' },
  { path: '/cards', name: 'cards' },
  { path: '/gallery', name: 'gallery' },
  { path: '/settings', name: 'settings' },
  { path: '/pricing', name: 'pricing' },
  { path: '/typography', name: 'typography' },
  { path: '/colors', name: 'colors' },
];

const modes = ['light', 'dark'] as const;

for (const route of routes) {
  for (const mode of modes) {
    test(`${route.name} - ${mode}`, async ({ page }) => {
      // Set theme mode before navigating
      await page.addInitScript(m => {
        localStorage.setItem('theme-mode', m);
      }, mode);

      await page.goto(route.path, { waitUntil: 'networkidle' });

      // Apply theme class for dark mode
      if (mode === 'dark') {
        await page.evaluate(() => {
          document.documentElement.classList.add('dark');
        });
      } else {
        await page.evaluate(() => {
          document.documentElement.classList.remove('dark');
        });
      }

      // Wait for any transitions/animations to settle
      await page.waitForTimeout(500);

      const project = test.info().project.name;
      await page.screenshot({
        path: `screenshots/${route.name}-${project}-${mode}.png`,
        fullPage: true,
      });
    });
  }
}
