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

After exporting, run this command from the project root:

```bash
git subtree push --prefix=build/docs origin gh-pages
```

## Notes
- Documentation source files (Markdown) live in `docs/` on the main branch
- Built HTML files are deployed to the `gh-pages` branch using git subtree
- Changes to documentation require rebuilding and redeploying