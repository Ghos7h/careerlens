import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F4F6F5",
        ink: "#0F2A2E",
        tide: "#0E7C86",
        tideSoft: "#D8EEF0",
        signal: "#C8431F",
        line: "#D3DCDB",
        mute: "#546968",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
