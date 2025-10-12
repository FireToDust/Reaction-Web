# GitHub Pages Documentation

This directory contains the static files for the GitHub Pages site that hosts the Reaction v2 documentation.

## Setup

1. **Configure Obsidian Export**: Set your webpage HTML export plugin to export to `gh-pages/docs/`
2. **Export Documentation**: Run the HTML export from Obsidian
3. **Enable GitHub Pages**: Go to your repository settings and enable GitHub Pages from the `gh-pages` directory

## Structure

```
gh-pages/
├── index.html          # Landing page
├── docs/              # Exported Obsidian documentation (generated)
└── README.md          # This file
```

## Obsidian Export Configuration

In Obsidian, configure the webpage HTML export plugin with these settings:

- **Export Directory**: `gh-pages/docs`
- **Include Attachments**: Yes
- **Include Graph View**: Optional
- **Custom CSS**: Optional (can be added later)

## GitHub Pages Configuration

1. Go to your repository settings
2. Navigate to "Pages" section
3. Set source to "Deploy from a branch"
4. Select branch: `main`
5. Select folder: `/ (root)` or `/gh-pages` if you create a separate branch
6. Save the configuration

Your documentation will be available at: `https://firetodust.github.io/Reaction-Web/`