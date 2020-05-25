module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true,
    jest: true,
  },
  extends: 'airbnb',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  rules: {
    'operator-linebreak': 'off',
    indent: 'off',
    'comma-dangle': 'off',
    'consistent-return': 'off',
    'no-confusing-arrow': 'off',
    'implicit-arrow-linebreak': 'off',
  },
  parserOptions: {
    ecmaVersion: 11,
  },
};
