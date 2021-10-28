module.exports = {
  root: true,
  parser: "vue-eslint-parser",

  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module'
  },

  env: {
    browser: true,
  },

  extends: [
    "plugin:vue/essential",
    "@vue/standard"
  ],

  plugins: [
    "html"
  ],

  rules: {
    "vue/html-closing-bracket-newline": ["error", {
      "singleline": "never",
      "multiline": "never"
    }],
    "quotes": ["error", "single"],
  },

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
