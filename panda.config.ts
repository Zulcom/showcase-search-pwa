import { defineConfig } from "@pandacss/dev";
import { createPreset } from "@park-ui/panda-preset";

export default defineConfig({
  preflight: true,
  presets: [
    "@pandacss/preset-base",
    createPreset({
      accentColor: "blue",
      grayColor: "neutral",
      borderRadius: "md",
    }),
  ],
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: [],
  theme: {
    extend: {
      tokens: {
        colors: {
          github: {
            bg: { value: "#0d1117" },
            bgSecondary: { value: "#161b22" },
            border: { value: "#30363d" },
            text: { value: "#c9d1d9" },
            textMuted: { value: "#8b949e" },
            link: { value: "#58a6ff" },
            star: { value: "#e3b341" },
          },
          // Radix Yellow scale
          yellow: {
            9: { value: "#ffe629" },
            10: { value: "#ffdc00" },
            11: { value: "#9e6c00" },
          },
        },
      },
      semanticTokens: {
        colors: {
          text: {
            default: { value: "{colors.fg.default}" },
            muted: { value: "{colors.fg.muted}" },
          },
          blue: {
            500: { value: "{colors.blue.9}" },
            600: { value: "{colors.blue.10}" },
          },
          yellow: {
            500: { value: "{colors.yellow.9}" },
            600: { value: "{colors.yellow.10}" },
          },
          red: {
            500: { value: "{colors.red.9}" },
            600: { value: "{colors.red.10}" },
          },
        },
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        spin: {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
      },
    },
  },
  jsxFramework: "react",
  outdir: "styled-system",
});
