# TypeScript Standards

- Enable `strict` mode in `tsconfig.json` — non-negotiable.
- Type all component props with explicit interfaces or type aliases; never use implicit `any`.
- Avoid type assertions (`as`) unless working with third-party boundaries — document why if used.
- Prefer `interface` for object shapes that may be extended; use `type` for unions, intersections, and utility types.
- Use `React.FC` sparingly — prefer typing props directly on the function signature.
- Define API response shapes explicitly; do not infer types from untyped `fetch` responses.
