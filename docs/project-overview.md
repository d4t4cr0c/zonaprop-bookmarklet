# ZonaProp Price Analyzer

A browser script that analyzes the real estate market in ZonaProp Argentina (zonaprop.com.ar)

## How it works:

1. User searches ZonaProp Argentina for a certain property for sale (for instance, a 1 bedroom + 1 living room aparment, in Spanish, departamento 2 ambientes) in a certain area (for instance, Colegiales, Capital Federal)

2. User triggers script through a bookmarklet in the browser bookmarks

3. Script scrapes the search results and extracts prices and square meter (metro cuadrado) sizes of the apartments, then calculates the average and median price per square meter

4. Script creates a HTML floating card in the right top corner of the viewport displaying results: type of property being searched, number of properties being scraped, average price per square meter, median price per mt2, max price, min price, histogram of square meter prices. Floating card should be draggable across the viewport so that user can move it and see anything behind it.

5. When user goes to the next page of the search results the card will disappear (because this is a browser script) but results should be stores in sessionStorage, so that if the user clicks again on the bookmarklet in the next search results page, this new page should be also scraped and results agreggated to those of the first page. When user wants to start afresh there should be a reset button to clear sessionStorage. 

## User friendly instructions

An HTML page to be deployed to GitHub Pages with instructions on how to use the script and a copy-to-clipboard button for easy copy-paste into the browser's bookmarks

