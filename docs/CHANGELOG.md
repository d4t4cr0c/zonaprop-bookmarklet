# Changelog

## Version 2.0 - Enhanced Auto-Update

### Major Changes

#### 🎯 Persistent Card Across Pages
- **Card persists**: The floating card now stays visible when navigating between search result pages
- **Auto-detection**: Automatically detects when you navigate to a new page
- **Auto-update**: Automatically aggregates data from new pages after 1 second

#### 🔄 Update Button
- **New "Actualizar" button**: Manually trigger data updates from the current page
- **Smart duplicate detection**: Uses property IDs to prevent adding the same property twice
- **Visual feedback**: Shows a green notification with the count of newly added properties
- **Duplicate protection**: Alerts if all properties on the page were already added

#### 🆔 Property ID Tracking
- **Unique identification**: Each property is tracked by its `data-id` attribute
- **Deduplication**: Prevents the same property from being counted multiple times
- **Cross-page tracking**: Maintains list of all scraped property IDs in sessionStorage

#### 📍 Page Navigation Detection
- **URL tracking**: Stores the last visited page URL
- **MutationObserver**: Listens for DOM changes that indicate navigation
- **Smart updates**: Only updates when navigating to a new results page

#### 🎨 UI Improvements
- **Two-button footer**: "Actualizar" (blue) and "Reiniciar" (red)
- **Hover effects**: Both buttons have visual feedback on hover
- **Success notifications**: Temporary green notification shows added property count
- **Simplified workflow**: No need to re-click bookmarklet on each page

### Technical Details

#### New Data Structure
```javascript
{
  properties: [...],           // Array of property objects with id, price, sqm, pricePerSqm
  propertyType: "...",         // Type of properties being analyzed
  scrapedPropertyIds: [...],   // Array of all scraped property IDs
  lastPageId: "..."            // Last page URL that was scraped
}
```

#### Property Object Structure
```javascript
{
  id: "57355557",              // Unique property ID from data-id attribute
  price: 99900,                // Price in USD
  sqm: 42,                     // Square meters
  pricePerSqm: 2378.57        // Calculated price per square meter
}
```

### Usage Changes

#### Old Workflow (v1.0)
1. Search on ZonaProp
2. Click bookmarklet
3. View results
4. Go to next page (card disappears)
5. Click bookmarklet again
6. Repeat for each page

#### New Workflow (v2.0)
1. Search on ZonaProp
2. Click bookmarklet (card appears)
3. Navigate to next page (card stays visible)
4. **Option A**: Wait 1 second for auto-update
5. **Option B**: Click "Actualizar" button
6. View updated statistics
7. Repeat for all pages

### Benefits

- ✅ **Faster**: No need to click bookmarklet repeatedly
- ✅ **Smarter**: Automatic duplicate detection
- ✅ **More reliable**: Property IDs prevent counting duplicates
- ✅ **Better UX**: Card persists across pages
- ✅ **Visual feedback**: Know exactly how many properties were added
- ✅ **Manual control**: Update button for manual triggering

### Breaking Changes

None - sessionStorage from v1.0 will be automatically migrated by adding missing fields with default values.

### Bug Fixes

- Fixed issue where same properties could be counted multiple times
- Fixed issue where card would disappear when navigating pages
- Improved error handling for missing property IDs

---

## Version 1.0 - Initial Release

### Features
- Basic property scraping
- Statistics calculation (average, median, min, max)
- Histogram visualization
- Draggable floating card
- Dark mode UI
- SessionStorage for data persistence
- Reset functionality
