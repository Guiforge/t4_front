module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    "plugin:vue/recommended",
    "eslint:recommended",
    "prettier/vue",
    "plugin:prettier/recommended",
    'airbnb-base',
    "plugin:security/recommended"
  ],
  plugins: [
    'vue', "security"
  ],
  rules: {
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "semi": [2, "never"],
    "no-console": "off",
    "vue/max-attributes-per-line": "off",
    "prettier/prettier": ["error", {
      "semi": false,
      "singleQuote": true,
      'trailingComma': "all",
      "arrowParens": "always",
    }],
  },
  "overrides": [
    {
      "files": ["*"],
      "rules": {
        "vue/component-name-in-template-casing": "off",
        "import/no-extraneous-dependencies" : "off",
      }
    }
  ],
  globals: {
    $nuxt: true
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};
