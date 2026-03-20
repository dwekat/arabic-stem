---
name: publish
description: Release and publish the package to npm using changesets workflow
disable-model-invocation: true
argument-hint: [patch|minor|major]
allowed-tools: Bash(npm *), Bash(git *), Bash(gh *), Bash(node *)
---

Release arabic-stem as a $ARGUMENTS version bump.

## Steps

1. Verify clean git state: `git status` must show no uncommitted changes
2. Verify tests pass: `npm test`
3. Verify npm auth: `npm whoami`
4. Create changeset: `npm run changeset` — select "$ARGUMENTS" as the bump type
5. Version bump: `npm run version`
6. Sync lockfile: `npm i` (changeset version does not update package-lock.json)
7. Commit version changes: `git add -A && git commit -m "chore: release v$(node -p "require('./package.json').version")"`
7. Push: `git push origin main --tags`
8. Build and publish: `npm run release`
9. Create GitHub release:
   ```
   VERSION=$(node -p "require('./package.json').version")
   gh release create "v${VERSION}" --title "v${VERSION}" --generate-notes
   ```
10. Report the published version and npm/GitHub release URLs
