import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 2021,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: true,
        document: true,
        fetch: true,
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'semi': ['error', 'always'],
    },
  },
];
