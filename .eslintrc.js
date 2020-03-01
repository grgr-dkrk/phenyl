module.exports = {
  env: { es6: true, node: true },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ["prettier", "@typescript-eslint", "jest"],
  extends: ["eslint:recommended", "plugin:jest/recommended"],
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
    "prefer-arrow-callback": ["error"]
  }
};
