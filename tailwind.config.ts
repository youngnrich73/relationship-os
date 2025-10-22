// tailwind.config.ts
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",      // ← 반드시 포함
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        primary: "var(--color-primary)",     // #FF7366
        secondary: "var(--color-secondary)", // #6AC2E3
        neutral: "var(--color-neutral)",     // #F5F5F2
        warning: "var(--color-warning)",     // #FFB547
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
      boxShadow: {
        soft: "0 6px 24px rgba(0,0,0,.06)",
        card: "0 10px 30px rgba(0,0,0,.08)",
      },
    },
  },
  plugins: [],
};
