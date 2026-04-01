/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor:{
        'PinPoint-green': "#0DCA6F",
        'PinPoint': '#06884A',
        'light-bg': '#CDFFE7',
        'PinPoint-blue': '#35CBF4',
        'option-three': '#7AE582'
      },
      borderColor:{
        'PinPoint': '#06884A',
        'PinPoint-blue': '#35CBF4',
      },
      colors: {
        'custom-teal': '#009379',
        'dark-teal': '#007a66'
      }
    },
  },
  plugins: [ function({ addUtilities }) {
    const newUtilities = {
      '.text-outline': {
        color: 'white',
        textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
      },
    }
    addUtilities(newUtilities)
  }],
}

