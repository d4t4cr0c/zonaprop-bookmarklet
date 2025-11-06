# ZonaProp Price Analyzer

A browser bookmarklet that analyzes real estate prices on ZonaProp Argentina (zonaprop.com.ar).

## Features

- **Automatic Scraping**: Extracts prices and square meter sizes from search results
- **Statistical Analysis**: Calculates average, median, min, and max prices per m²
- **Visual Histogram**: Shows price distribution with count numbers in each bar
- **Persistent Card**: Card stays visible when navigating between pages
- **Auto-Update**: Automatically detects new pages and aggregates data
- **Smart Deduplication**: Uses property IDs to prevent counting duplicates
- **Manual Update**: "Actualizar" button to manually trigger data updates
- **Multi-page Aggregation**: Accumulates data across multiple search result pages using sessionStorage
- **Draggable UI**: Floating card that can be repositioned on the page
- **Easy Reset**: Clear all accumulated data with one click
- **Dark Mode**: Beautiful dark color scheme for better visibility

## Project Structure

```
zonaprop-bookmarklet/
├── index.html              # GitHub Pages - Installation instructions
├── src/
│   └── zonaprop-analyzer.js   # Main bookmarklet script
├── example-html/
│   └── search-result-card.html    # Example of real ZonaProp HTML structure
├── docs/
│   └── project-overview.md    # Project documentation
└── README.md               # This file
```

## Installation

### For Users

Visit the GitHub Pages site (deploy `index.html`) and follow the instructions to:

1. **Drag and drop** the bookmarklet button to your bookmarks bar, OR
2. **Copy the code** and create a bookmark manually

### For Developers

1. Clone this repository
2. Open `test.html` in your browser to test locally
3. Click "Ejecutar Analyzer (Test)" to run the script
4. Modify `src/zonaprop-analyzer.js` as needed

## Usage

1. Go to [ZonaProp.com.ar](https://www.zonaprop.com.ar)
2. Search for properties (e.g., "departamento 2 ambientes Colegiales")
3. On the search results page, click the bookmarklet in your bookmarks bar
4. A floating card will appear with the price analysis
5. Navigate to the next page - **the card persists!**
6. After ~1 second, you'll see a blue notification and the data will auto-update
7. Alternatively, click the "Actualizar" button to manually update
8. Continue navigating pages - data aggregates automatically
9. To reset all data: click the "Reiniciar" button in the card

## How It Works

The bookmarklet:

1. Scrapes all property cards with `data-qa="posting PROPERTY"`
2. Extracts price from `data-qa="POSTING_CARD_PRICE"` (USD format)
3. Extracts square meters from `data-qa="POSTING_CARD_FEATURES"` (m² format)
4. Calculates price per square meter for each property
5. Stores data in `sessionStorage` for multi-page aggregation
6. Displays statistics and histogram in a draggable floating card

## Technical Details

### Data Extraction

- **Price**: Matches pattern `USD\s*([\d,.]+)` and removes formatting
- **Square Meters**: Matches pattern `(\d+)\s*m²`
- **Price per m²**: `price / sqm`

### Storage

Uses `sessionStorage` with key `zonaprop_analyzer_data`:

```javascript
{
  properties: [
    { price: 99900, sqm: 42, pricePerSqm: 2378.57 },
    // ...
  ],
  propertyType: "Departamentos en Colegiales"
}
```

### UI Components

- **Header**: Draggable, shows property type
- **Stats Section**: Count, average, median, min, max
- **Histogram**: 10-bin distribution of prices per m²
- **Footer**: Reset button to clear data

## Deployment

To deploy to GitHub Pages:

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Set source to "main" branch, root folder
4. Your site will be available at `https://username.github.io/zonaprop-bookmarklet/`

## Browser Compatibility

- ✅ Chrome/Edge (Desktop)
- ✅ Firefox (Desktop)
- ✅ Safari (Desktop)
- ⚠️ Mobile browsers (limited bookmarklet support)

## License

MIT License - Feel free to use and modify


## Support

If you find this tool useful, consider:

- ⭐ Starring the repository
- 🐛 Reporting issues
- 💡 Suggesting features
- 🔄 Sharing with friends

---

**Made with ❤️ to simplify property searching in Argentina**
