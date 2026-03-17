# Dependency Security

Before installing any npm package, audit it for known vulnerabilities and supply-chain risk. A package with a high or critical severity vulnerability must not be installed — find a safe alternative instead.

## Pre-install checklist

Run all three checks before adding a new dependency:

```bash
# 1. Check the package's published vulnerability history
npm audit --package-lock-only   # after a dry-run add, before committing

# 2. Inspect the package directly on the npm advisory database
#    https://www.npmjs.com/advisories  (search by package name)

# 3. Review basic health signals on npm
#    - Weekly downloads (prefer packages with broad adoption)
#    - Last publish date (unmaintained = higher risk)
#    - Number of open issues / CVEs on GitHub
```

## Severity policy

| Severity       | Action                                                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Critical**   | Do not install. Find an alternative.                                                                                      |
| **High**       | Do not install. Find an alternative.                                                                                      |
| **Moderate**   | Investigate. Only install if no viable alternative exists and the vulnerability does not affect your usage; document why. |
| **Low / Info** | Acceptable with awareness; monitor for patches.                                                                           |

## Finding alternatives

If a preferred package has high/critical vulnerabilities:

1. Search for actively maintained forks or drop-in replacements.
2. Check if the vulnerability is in a dependency of the dependency (`npm explain <package>`) — if the vulnerable transitive dep is not reachable from your code path, document this explicitly.
3. Consider implementing the functionality natively if the package is small-scope (e.g. a single utility function).
4. If no safe alternative exists, escalate to the team rather than installing a known-vulnerable package.

## Transitive dependencies

Transitive (indirect) dependencies are packages pulled in by your direct dependencies. They appear in `node_modules` and `package-lock.json` but not in your `package.json`, which makes them easy to overlook — yet they are equally capable of introducing vulnerabilities.

**Inspecting the dependency tree**

```bash
# See every path that introduces a specific package
npm explain <package-name>

# List all versions of a package resolved in the tree
npm ls <package-name>

# Full audit report with dep paths
npm audit --json | jq '.vulnerabilities'
```

**Rules**

- When `npm audit` reports a vulnerability in a transitive dependency, trace the full path with `npm explain <package>` before deciding how to act.
- If the vulnerable transitive package is not reachable from your code path (e.g. it is only used in a dev-only build step that never runs in production), document this explicitly in a comment near the relevant `package.json` entry or in a `SECURITY.md` note.
- If the vulnerable transitive package **is** reachable, treat it with the same severity policy as a direct dependency — do not install or retain it if severity is high or critical.

**Forcing a safe version with `overrides`**

When a direct dependency pulls in a vulnerable transitive package and no updated version of the direct dependency is available, use the `overrides` field in `package.json` to pin the transitive package to a patched version:

```json
{
  "overrides": {
    "vulnerable-transitive-package": ">=2.3.1"
  }
}
```

- Always include a comment in a companion `SECURITY.md` or PR description explaining which CVE the override addresses and when it can be removed.
- Re-run `npm install` and `npm audit` after adding an override to confirm the vulnerability is resolved.
- Review and remove stale overrides whenever the direct dependency is upgraded — an override that is no longer needed becomes maintenance debt.

**Keeping transitive deps current**

- Run `npm audit fix` regularly. Prefer `--dry-run` first to review proposed changes before applying them.
- Use `npm audit fix --force` only when you understand what major-version bumps it will introduce — it can introduce breaking changes.
- Review the full `package-lock.json` diff in every PR that touches dependencies, not just `package.json`.

## Ongoing maintenance

- Run `npm audit` as part of the CI pipeline. A **high or critical** finding fails the build.
- Review `npm outdated` regularly and keep dependencies current.
- Pin exact versions (`--save-exact`) for security-sensitive packages so patch-level updates are deliberate, not automatic.
