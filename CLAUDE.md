# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Arabic word stemmer — zero-dependency, pattern-based morphological stemmer for Arabic. Outputs both root stems and normalized forms. Supports CommonJS and ES modules.

## Commands

```bash
npm test              # run all tests (vitest)
npm run test:watch    # watch mode
npm run test:cov      # coverage report
npm run lint          # eslint --fix
npm run build         # tsc → rollup (esm + umd) → terser → gzip
npm run release       # build + changeset publish
```

Run a single test file:
```bash
npx vitest run src/AffixCleaner.spec.ts
```

## Architecture

The stemmer is two classes:

- **`Stemmer`** (`src/index.ts`) — entry point. Strips diacritics, checks stop words, pre-normalizes (hamza/taa-marbuta/alef-maqsura), delegates prefix removal to AffixCleaner, then matches against morphological patterns (وزن) of lengths 3–8 to extract trilateral roots. Post-normalizes weak letters.
- **`AffixCleaner`** (`src/AffixCleaner.ts`) — manages prefix/suffix lookup tables and tracks cumulative removed affixes. Multi-char prefixes (e.g. `وكال`, `فبال`) represent fused conjunction+preposition+article combinations. The `isValidPrefix` method validates that stacked single-char prefixes form a known multi-char prefix.
- **`Priority`** (`src/enums/priority.ts`) — enum controlling whether suffix or prefix is stripped first.

## Stemming Pipeline

`stem(token)` → strip diacritics → stop word check → pre-normalize → remove prefixes (4→3→2 chars) → pattern match (longest first, recurse on 4+ char matches) → post-normalize roots.

## Release Workflow

Uses `@changesets/cli`. Run `/publish patch|minor|major` or manually: `npm run changeset` → `npm run version` → `npm run release`.

## Development Process

Follow strict RED-GREEN TDD: write a failing test first, then write the minimal code to make it pass, then refactor. No production code without a failing test driving it.

## Commit Convention

Conventional commits enforced by commitlint via husky: `type(scope?): subject`. Pre-commit hook runs `npm test`.

## Maintaining This File

Keep CLAUDE.md in sync with the repo. Update it when commands, architecture, or workflows change.
