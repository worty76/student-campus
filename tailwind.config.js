module.exports = {
  purge: [],
  content: ["./node_modules/@ieltsrealtest/ui/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: "var(--font-sans)",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};