---
name: publish
description: Cut a release — bump version, tag, and push; CI publishes to npm
disable-model-invocation: true
argument-hint: [patch|minor|major]
allowed-tools: Bash(npm *), Bash(git *), Bash(gh *), Bash(node *)
---

Release arabic-stem as a $ARGUMENTS version bump. Publishing is handled by the
`Release` GitHub Actions workflow, which fires on the pushed `v*` tag.

## Steps

1. Verify clean git state: `git status` must show no uncommitted changes
2. Verify tests pass: `npm test`
3. Create changeset: `npm run changeset` — select "$ARGUMENTS" as the bump type
4. Version bump: `npm run version` (bumps package.json, writes CHANGELOG, syncs lockfile)
5. Commit version changes: `git add -A && git commit -m "chore: release v$(node -p "require('./package.json').version")"`
6. Tag the release: `git tag "v$(node -p "require('./package.json').version")"`
7. Push commit and tag: `git push origin main --follow-tags`
8. CI publishes to npm and creates the GitHub release. Report the run URL:
   `gh run list --workflow=release.yml --limit=1`
