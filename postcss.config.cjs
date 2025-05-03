
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {
      tailwindConfig: require.resolve('./tailwind.config.cjs')
    },
    'autoprefixer': {}
  }
}