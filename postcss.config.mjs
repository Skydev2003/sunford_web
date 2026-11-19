const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    // Retain Next's default CSS transforms when supplying a PostCSS config.
    "next/dist/compiled/postcss-flexbugs-fixes": {},
    "next/dist/compiled/postcss-preset-env": {
      stage: 3,
      autoprefixer: { flexbox: "no-2009" },
      features: { "custom-properties": false },
    },
  },
};

export default config;
