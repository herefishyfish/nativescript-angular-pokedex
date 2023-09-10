/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{css,xml,html,vue,svelte,ts,tsx}'],
  presets: [require('@spartan-ng/ui-core/hlm-tailwind-preset')],
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
