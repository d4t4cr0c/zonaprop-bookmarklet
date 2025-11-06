# Debugging Guide

## Testing the Auto-Update Feature

1. Open ZonaProp and search for properties
2. Open browser console (F12 → Console tab)
3. Click the bookmarklet
4. You should see logs like:
   ```
   [ZonaProp Analyzer] Initial page: /propiedades/venta-departamento-colegiales-capital-federal.html?pagina=1
   [ZonaProp Analyzer] Auto-detection started. Interval ID: 123
   ```

5. Navigate to the next page
6. Watch the console for these logs:
   ```
   [ZonaProp Analyzer] Page change detected!
   [ZonaProp Analyzer] Old: /propiedades/...?pagina=1
   [ZonaProp Analyzer] New: /propiedades/...?pagina=2
   [ZonaProp Analyzer] Checking for properties...
   [ZonaProp Analyzer] Found 20 property cards
   [ZonaProp Analyzer] Calling updateData()...
   [ZonaProp Analyzer] updateData() called
   [ZonaProp Analyzer] Stored data has 20 properties
   [ZonaProp Analyzer] Scraped 20 properties from current page
   [ZonaProp Analyzer] Already have 20 property IDs
   [ZonaProp Analyzer] Found 20 new unique properties
   ```

7. The card should update with the new totals

## Common Issues

### Issue: No "Page change detected!" log
**Problem**: URL is not changing (not SPA navigation, or using hash routing)
**Solution**: You'll need to manually click "Actualizar" button on each page

### Issue: "Found 0 property cards"
**Problem**: Page hasn't loaded yet, or selector is wrong
**Solution**: Wait longer, or check if ZonaProp changed their HTML structure

### Issue: "Found 0 new unique properties"
**Problem**: All properties on this page were already scraped
**Solution**: This is expected if you revisit a page you already analyzed

### Issue: Interval ID shows but nothing happens
**Problem**: Auto-detection is running but URL isn't changing
**Solution**: Check if `window.location.href` changes when you navigate

## Manual Testing Commands

Open console and run these commands to debug:

```javascript
// Check current URL
console.log(window.location.href);

// Check if properties exist
console.log(document.querySelectorAll('[data-qa="posting PROPERTY"]').length);

// Check stored data
console.log(JSON.parse(sessionStorage.getItem('zonaprop_analyzer_data')));

// Check if interval is running
console.log(window.zonapropAnalyzerInterval);

// Manually trigger update
// (You'll need to copy the updateData function from the script)
```

## Force Manual Update

If auto-update isn't working, just click the blue "Actualizar" button on the card - it does the same thing!
