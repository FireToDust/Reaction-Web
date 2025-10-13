# Building Documentation

## Overview
The documentation system uses Obsidian for authoring (in `docs/`) and exports to HTML for GitHub Pages deployment via git subtree.

## Prerequisites
- Obsidian with "Webpage HTML Export" plugin installed
- Git command line tools

## Build Process

### 1. Export Documentation from Obsidian
1. Open the `docs/` folder as a vault in Obsidian
2. Either:
   - Click the "Export as HTML" button (added by Webpage HTML Export plugin)
   - Or run command "Webpage HTML Export: Export using previous settings"
3. Ensure export target is set to `build/docs`

### 2. Deploy to GitHub Pages

After exporting, commit and push the changes in the worktree:

```bash
cd build/docs
git add .
git commit -m "Update documentation"
git push
cd ../..
```

## Notes
- Documentation source files (Markdown) live in `docs/` on the main branch
- Built HTML files are in `build/docs/` which is a git worktree of the `gh-pages` branch
- The worktree allows direct commits to gh-pages without switching branches
- Changes to documentation require rebuilding and redeploying