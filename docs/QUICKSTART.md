# Quick Start Guide

## For Users

### Installation (30 seconds)

1. Open `index.html` in your browser (or visit the GitHub Pages URL)
2. **Drag** the purple button "📊 ZonaProp Analyzer" to your bookmarks bar
3. Done!

### Usage (10 seconds)

1. Go to ZonaProp.com.ar
2. Search for properties
3. Click the bookmarklet in your bookmarks
4. View the analysis in the floating card

### Features at a Glance

| Feature | Description |
|---------|-------------|
| 📊 Statistics | Average, median, min, max prices per m² |
| 📈 Histogram | Visual price distribution |
| 📄 Multi-page | Accumulates data across pages |
| 🎯 Draggable | Move the card around |
| 🔄 Reset | Clear data and start fresh |

## For Developers

### Project Files

```
📁 zonaprop-bookmarklet/
├── 🌐 index.html              # GitHub Pages (user instructions)
├── 🧪 test.html               # Local testing page
├── 📖 README.md               # Full documentation
├── 📋 QUICKSTART.md           # This file
├── 📁 src/
│   └── 💻 zonaprop-analyzer.js   # Main bookmarklet code
├── 📁 docs/
│   └── 📄 project-overview.md    # Project specification
└── 📁 examples/
    └── 🗂️  search-results.html    # Real HTML structure sample
```


### Deploy to GitHub Pages

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/zonaprop-bookmarklet.git
git push -u origin main

# Enable GitHub Pages
# Go to: Settings → Pages → Source: main branch
```

## Troubleshooting

### "No properties found"
- Make sure you're on a ZonaProp search results page
- Check that properties have both price (USD) and size (m²)

### Card doesn't appear
- Check browser console for errors (F12)
- Try clearing sessionStorage: `sessionStorage.clear()`

### Data not accumulating
- SessionStorage clears when tab closes
- Keep the same tab open while navigating pages

### Bookmarklet doesn't work
- Some browsers block bookmarklets on certain pages
- Try the test page first to verify installation

## Key Code Snippets

### Scraping selector patterns
```javascript
'[data-qa="posting PROPERTY"]'      // Property cards
'[data-qa="POSTING_CARD_PRICE"]'    // Price element
'[data-qa="POSTING_CARD_FEATURES"]' // Features (includes m²)
```

### Price extraction
```javascript
/USD\s*([\d,.]+)/ // Matches "USD 99.900" or "USD 120,000"
```

### Size extraction
```javascript
/(\d+)\s*m²/ // Matches "42 m² tot." or "50 m²"
```



---

Need help? Check the [full README](README.md) or open an issue on GitHub.
