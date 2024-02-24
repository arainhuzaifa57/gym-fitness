/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        ibmMedium: ["IBMPlexSans-Medium"],
        ibmRegular: ["IBMPlexSans-Regular"],
        ibmExtraThin: ["IBMPlexSans-ExtraLight"],
        ibmThin: ["IBMPlexSans-Thin"],
        ibmBold: ["IBMPlexSans-Bold"],
      },
      colors: {
        // Define your custom colors
        'custom-stroke': '#182130',
        'custom-green': '#13ce66',
        'card-bg': '#172033',
        'icon-bg': '#102839',
        'primary': '#0891B2',
        'background': '#111828',

        // You can also use RGB, RGBA, HSL, HSLA, etc.
      },
    },
  },
  plugins: [],
};
