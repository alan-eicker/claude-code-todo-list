# Linting and Formatting

All projects must enforce the following tools via CI. No exceptions.

## ESLint

- Use the modern flat config format (`eslint.config.js` / `eslint.config.mjs`).
- Required rule sets:
  - `eslint:recommended`
  - `plugin:react/recommended`
  - `plugin:react-hooks/recommended`
  - `plugin:jsx-a11y/recommended`
  - `plugin:@typescript-eslint/recommended`
- `react/react-in-jsx-scope` — disable (not needed with modern JSX transform).
- `no-console` — warn in development, error in CI.
- `@typescript-eslint/no-explicit-any` — error.
- `jsx-a11y` rules must never be disabled without a documented justification.

## Prettier

- Single source of truth for all code formatting — never configure formatting rules in ESLint.
- All projects must include a `.prettierrc` at the repo root. Required rules:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- Run `prettier --check` in CI; fail the build on formatting violations.

## VS Code

Every project must include a `.vscode/settings.json` that sets Prettier as the default formatter, points to `.prettierrc`, and enables format-on-save:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.configPath": ".prettierrc",
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[css]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[json]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }
}
```

- `"prettier.configPath": ".prettierrc"` ensures the extension reads from the project config, not any global user settings.
- Do not commit `.vscode/extensions.json` or other personal editor preferences — only formatter settings belong here.
