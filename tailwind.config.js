/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        manrope: ["Manrope_400Regular"],
        manropeMedium: ["Manrope_500Medium"],
        manropeSemiBold: ["Manrope_600SemiBold"],
        manropeBold: ["Manrope_700Bold"],
        manropeExtraBold: ["Manrope_800ExtraBold"],

        cormorantSemiBold: ["CormorantGaramond_600SemiBold"],
        cormorantBold: ["CormorantGaramond_700Bold"],
      },
      colors: {
        primary: "#A875D1",
        primaryDark: "#8F5DB9",
        primaryLight: "#E8D9F3",
        primarySoft: "#F0E6F6",

        background: "#F7F2FA",
        backgroundSoft: "#FBF8FD",

        surface: "#FFFCFF",
        surfaceSoft: "#FBF8FD",
        surfaceLight: "#FDF9FF",

        logoBackground: "#BFA2DB",
        accent: "#A77BCB",
        accentLight: "#E8D9F3",

        text: "#3D3046",
        textDark: "#2F2638",
        textMuted: "#777085",
        textLight: "#817A90",

        border: "#DED8E7",
        borderSoft: "#E9DFF1",
        shadow: "#E9DFF1",
      },
    },
  },
  plugins: [],
};
