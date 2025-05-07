

  module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./src/index.ts"
    ],
    theme: {
      extend: {
        fontFamily: {
          'nexa-bold': ['"Nexa Bold"', 'sans-serif'],
          'nexa-light': ['"Nexa Light"', 'sans-serif']
        }
      },
    },
    plugins: [],
    safelist: [
      'bg-blue-500',
      'hover:bg-blue-700',
      'text-white',
      'font-bold',
      'py-2',
      'px-4',
      'rounded',
      'shadow'
    ]
  }


