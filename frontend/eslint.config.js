import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // This rule is overly aggressive in React 19 — it flags the common and
      // idiomatic pattern of calling an async data-fetching function from useEffect.
      // The pattern is correct and does not cause infinite loops because the fetch
      // functions do not change identity on every render.
      'react-hooks/set-state-in-effect': 'off',
      // Allow named exports alongside default exports in component files
      // (required for context providers that export both Provider and hook)
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
])
