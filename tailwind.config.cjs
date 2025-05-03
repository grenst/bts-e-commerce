

  module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./src/index.ts"
    ],
    theme: {
      extend: {},
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


