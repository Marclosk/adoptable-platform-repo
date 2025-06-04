module.exports = {
    env: {
      browser: true,
      es2021: true,
    },
    extends: [
      "eslint:recommended",
      "plugin:react/recommended",
      "airbnb",           // o "standard"
      "prettier"
    ],
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 12,
      sourceType: "module",
    },
    plugins: ["react", "react-hooks"],
    rules: {
      // tus reglas personalizadas (opcional)
      "react/jsx-filename-extension": [1, { extensions: [".js", ".jsx"] }],
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  };
  