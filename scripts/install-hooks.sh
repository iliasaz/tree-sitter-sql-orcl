#!/usr/bin/env bash
# One-shot installer for repo-tracked git hooks. Run once after cloning.
set -e

repo_root=$(cd "$(dirname "$0")/.." && pwd)
cd "$repo_root"

git config core.hooksPath .githooks
chmod +x .githooks/pre-commit

echo "Hooks installed: core.hooksPath = .githooks"
echo "Disable with: git config --unset core.hooksPath"
