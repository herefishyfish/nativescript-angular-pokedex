/** @type {import('tailwindcss').Config} */
const spartanPreset = require('@spartan-ng/ui-core/hlm-tailwind-preset');
// Remove calcs in border-radius (not supported by NativeScript)
spartanPreset.theme.extend.borderRadius = {
  sm: `var(--radius)`,
  md: `var(--radius)`,
  lg: `var(--radius)`,
};

module.exports = {
  content: ['./src/**/*.{css,xml,html,vue,svelte,ts,tsx}'],
  presets: [spartanPreset],
  // use the .ns-dark class to control dark mode (applied by NativeScript) - since 'media' (default) is not supported.
  darkMode: ['class', '.ns-dark'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false, // disables browser-specific resets
  },
};
