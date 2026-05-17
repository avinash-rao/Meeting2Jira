/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f1117',
          card: '#1a1d27',
          navbar: '#0a0d14',
          border: '#2d3149',
        },
        primary: '#4F6EF7',
        success: '#22c55e',
        warning: '#f59e0b',
        jira: {
          bg: '#F4F5F7',
          card: '#FFFFFF',
          nav: '#0052CC',
          navHover: '#0747A6',
          primary: '#0052CC',
          primaryHover: '#0747A6',
          border: '#DFE1E6',
          textPrimary: '#172B4D',
          textSecondary: '#6B778C',
          success: '#00875A',
          successBg: '#E3FCEF',
          warning: '#FF8B00',
          warningBg: '#FFFAE6',
          error: '#DE350B',
          errorBg: '#FFEBE6',
          shadow: 'rgba(9,30,66,0.13)',
        }
      },
    },
  },
  plugins: [],
}

// Made with Bob
