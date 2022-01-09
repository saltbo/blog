module.exports = {
  purge: [
    'docs/.vuepress/theme/**/*.html',
    'docs/.vuepress/theme/**/*.vue',
    'docs/.vuepress/theme/**/*.jsx',
  ],
  theme: {
    container: {
      padding: {
        default: '0rem',
        sm: '2rem',
        lg: '4rem',
        xl: '14rem',
      },
    },
    boxShadow: {
      default: '0 2px 12px 0 rgba(0,0,0,.1), 0 1px 2px 0 rgba(0, 0, 0, .06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, .1), 0 2px 4px -1px rgba(0, 0, 0, .06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, .1), 0 4px 6px -2px rgba(0, 0, 0, .05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, .1), 0 10px 10px -5px rgba(0, 0, 0, .04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, .25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      'none': 'none',
    },
    extend: {},
  },
  variants: {},
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
