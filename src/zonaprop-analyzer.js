(function() {
  'use strict';

  // Configuration
  const STORAGE_KEY = 'zonaprop_analyzer_data';
  const CARD_ID = 'zonaprop-analyzer-card';

  // Get current page identifier (URL without query params for page number)
  function getCurrentPageId() {
    const url = new URL(window.location.href);
    return url.pathname + url.search;
  }

  // Scrape property data from current page
  function scrapePropertyData() {
    const properties = [];
    const propertyIds = new Set();
    const cards = document.querySelectorAll('[data-qa="posting PROPERTY"]');

    console.log('[ZonaProp Analyzer] Found', cards.length, 'property cards');

    cards.forEach((card, index) => {
      try {
        // Extract price first to potentially use in ID
        const priceElement = card.querySelector('[data-qa="POSTING_CARD_PRICE"]');
        if (!priceElement) {
          console.log('[ZonaProp Analyzer] Card', index, 'missing price element');
          return;
        }

        const priceText = priceElement.textContent.trim();
        const priceMatch = priceText.match(/USD\s*([\d,.]+)/);
        if (!priceMatch) return;

        const price = parseFloat(priceMatch[1].replace(/[.,]/g, ''));
        if (isNaN(price)) return;

        // Extract square meters
        const featuresElement = card.querySelector('[data-qa="POSTING_CARD_FEATURES"]');
        if (!featuresElement) return;

        const featuresText = featuresElement.textContent;
        const sqmMatch = featuresText.match(/(\d+)\s*m²/);
        if (!sqmMatch) return;

        const sqm = parseFloat(sqmMatch[1]);
        if (isNaN(sqm) || sqm === 0) return;

        // Get or generate unique property ID
        let propertyId = card.getAttribute('data-id');
        if (!propertyId) {
          // Generate fallback ID based on price and sqm to help detect duplicates
          propertyId = `fallback_${price}_${sqm}`;
          console.warn('[ZonaProp Analyzer] Card', index, 'missing data-id, using fallback:', propertyId);
        }

        // Calculate price per square meter
        const pricePerSqm = price / sqm;

        properties.push({
          id: propertyId,
          price: price,
          sqm: sqm,
          pricePerSqm: pricePerSqm
        });

        propertyIds.add(propertyId);
      } catch (error) {
        console.error('Error scraping property:', error);
      }
    });

    return { properties, propertyIds };
  }

  // Get property type from page
  function getPropertyType() {
    const breadcrumb = document.querySelector('h1, .breadcrumb, [data-qa="breadcrumb"]');
    if (breadcrumb) {
      return breadcrumb.textContent.trim();
    }
    return 'Propiedades';
  }

  // Load data from sessionStorage
  function loadStoredData() {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading stored data:', error);
    }
    return {
      properties: [],
      propertyType: '',
      scrapedPropertyIds: [],
      lastPageId: null
    };
  }

  // Save data to sessionStorage
  function saveData(data) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Calculate statistics
  function calculateStats(properties) {
    if (properties.length === 0) {
      return null;
    }

    const pricesPerSqm = properties.map(p => p.pricePerSqm).sort((a, b) => a - b);
    const prices = properties.map(p => p.price).sort((a, b) => a - b);

    const avgPricePerSqm = pricesPerSqm.reduce((a, b) => a + b, 0) / pricesPerSqm.length;
    const medianPricePerSqm = pricesPerSqm.length % 2 === 0
      ? (pricesPerSqm[pricesPerSqm.length / 2 - 1] + pricesPerSqm[pricesPerSqm.length / 2]) / 2
      : pricesPerSqm[Math.floor(pricesPerSqm.length / 2)];

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    // Get most frequent price from histogram
    const histogramData = createHistogram(pricesPerSqm);

    return {
      count: properties.length,
      avgPricePerSqm: avgPricePerSqm,
      medianPricePerSqm: medianPricePerSqm,
      mostFrequentPricePerSqm: histogramData.mostFrequentPrice,
      minPrice: minPrice,
      maxPrice: maxPrice,
      pricesPerSqm: pricesPerSqm
    };
  }

  // Create histogram data
  function createHistogram(pricesPerSqm, bins = 10) {
    if (pricesPerSqm.length === 0) return { histogram: [], mostFrequentPrice: null };

    const min = Math.min(...pricesPerSqm);
    const max = Math.max(...pricesPerSqm);
    const binSize = (max - min) / bins;

    const histogram = Array(bins).fill(0).map(() => ({ count: 0, prices: [] }));
    const binLabels = [];

    for (let i = 0; i < bins; i++) {
      binLabels.push(Math.round(min + i * binSize));
    }

    pricesPerSqm.forEach(price => {
      const binIndex = Math.min(Math.floor((price - min) / binSize), bins - 1);
      histogram[binIndex].count++;
      histogram[binIndex].prices.push(price);
    });

    // Find the bin with the highest count
    let maxCount = 0;
    let maxBinIndex = 0;
    histogram.forEach((bin, i) => {
      if (bin.count > maxCount) {
        maxCount = bin.count;
        maxBinIndex = i;
      }
    });

    // Calculate average price in the most frequent bin
    const mostFrequentBin = histogram[maxBinIndex];
    const mostFrequentPrice = mostFrequentBin.prices.length > 0
      ? mostFrequentBin.prices.reduce((a, b) => a + b, 0) / mostFrequentBin.prices.length
      : null;

    return {
      histogram: histogram.map((bin, i) => ({
        label: binLabels[i],
        count: bin.count
      })),
      mostFrequentPrice: mostFrequentPrice
    };
  }

  // Format currency
  function formatCurrency(value) {
    return 'USD ' + Math.round(value).toLocaleString('es-AR');
  }

  // Update card content
  function updateCardContent(contentElement, stats) {
    if (!stats) {
      contentElement.innerHTML = '<div style="color: #999;">No se encontraron propiedades.</div>';
      return;
    }

    const histogramData = createHistogram(stats.pricesPerSqm);
    const histogram = histogramData.histogram;
    const maxCount = Math.max(...histogram.map(h => h.count));

    contentElement.innerHTML = `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #999; margin-bottom: 4px;">Propiedades analizadas</div>
        <div style="font-size: 24px; font-weight: 700; color: #e0e0e0;">${stats.count}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 12px; color: #999; margin-bottom: 4px;">Precio promedio por m²</div>
          <div style="font-size: 18px; font-weight: 600; color: #8b9dff;">${formatCurrency(stats.avgPricePerSqm)}</div>
        </div>
        <div>
          <div style="font-size: 12px; color: #999; margin-bottom: 4px;">Precio mediano por m²</div>
          <div style="font-size: 18px; font-weight: 600; color: #b88fd8;">${formatCurrency(stats.medianPricePerSqm)}</div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #999; margin-bottom: 4px;">Precio más frecuente por m²</div>
        <div style="font-size: 20px; font-weight: 600; color: #fbbf24;">${stats.mostFrequentPricePerSqm ? formatCurrency(stats.mostFrequentPricePerSqm) : 'N/A'}</div>
      </div>

      ${stats.mostFrequentPricePerSqm ? `
      <div style="margin-bottom: 16px; padding: 10px 12px; background: #2a2a2a; border-radius: 8px; border: 1px solid #3a3a3a;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <input
              type="number"
              id="zonaprop-sqm-input"
              value="60"
              min="1"
              max="999"
              style="width: 50px; padding: 6px; background: #1e1e1e; border: 1px solid #555; border-radius: 4px; color: #e0e0e0; font-size: 14px; font-weight: 600; text-align: center;"
            />
            <span style="color: #999; font-size: 13px;">m² =</span>
          </div>
          <div id="zonaprop-total-price" style="font-size: 18px; font-weight: 700; color: #10b981;">${formatCurrency(stats.mostFrequentPricePerSqm * 60)}</div>
        </div>
      </div>
      ` : ''}

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 11px; color: #999; margin-bottom: 4px;">Precio mínimo</div>
          <div style="font-size: 16px; font-weight: 600; color: #4ade80;">${formatCurrency(stats.minPrice)}</div>
        </div>
        <div>
          <div style="font-size: 11px; color: #999; margin-bottom: 4px;">Precio máximo</div>
          <div style="font-size: 16px; font-weight: 600; color: #f87171;">${formatCurrency(stats.maxPrice)}</div>
        </div>
      </div>

      <div style="margin-bottom: 16px;">
        <div style="font-size: 12px; color: #999; margin-bottom: 8px;">Distribución de precios por m²</div>
        <div style="display: flex; align-items: flex-end; height: 100px; gap: 2px; background: #2a2a2a; padding: 8px; border-radius: 6px;">
          ${histogram.map(h => `
            <div style="flex: 1; background: linear-gradient(to top, #4a5fb8, #9b6ec9); border-radius: 2px 2px 0 0; height: ${(h.count / maxCount) * 100}%; position: relative; min-height: ${h.count > 0 ? '20px' : '2px'}; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2px;" title="${formatCurrency(h.label)}: ${h.count} propiedades">
              <span style="font-size: 10px; color: #fff; font-weight: 600; text-shadow: 0 1px 2px rgba(0,0,0,0.5);">${h.count > 0 ? h.count : ''}</span>
            </div>
          `).join('')}
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #888; margin-top: 4px;">
          <span>${formatCurrency(histogram[0].label)}</span>
          <span>${formatCurrency(histogram[histogram.length - 1].label)}</span>
        </div>
      </div>
    `;

    // Add event listener for calculator input
    if (stats.mostFrequentPricePerSqm) {
      setTimeout(() => {
        const sqmInput = document.getElementById('zonaprop-sqm-input');
        const totalPriceDisplay = document.getElementById('zonaprop-total-price');

        if (sqmInput && totalPriceDisplay) {
          sqmInput.addEventListener('input', (e) => {
            const sqm = parseFloat(e.target.value) || 0;
            const totalPrice = stats.mostFrequentPricePerSqm * sqm;
            totalPriceDisplay.textContent = formatCurrency(totalPrice);
          });
        }
      }, 0);
    }
  }

  // Create the floating card UI
  function createFloatingCard(stats, propertyType) {
    const card = document.createElement('div');
    card.id = CARD_ID;
    card.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 450px;
      max-height: 80vh;
      background: #1e1e1e;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid #333;
    `;

    // Header (draggable)
    const header = document.createElement('div');
    header.style.cssText = `
      background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
      color: #e0e0e0;
      padding: 16px;
      cursor: move;
      user-select: none;
      border-bottom: 1px solid #333;
    `;
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 24px; font-weight: 600; color: #e0e0e0;">ZonaProp Analyzer</h3>
        <button id="zonaprop-close-btn" style="background: none; border: none; color: #e0e0e0; font-size: 24px; cursor: pointer; padding: 0; line-height: 1;">&times;</button>
      </div>
      <div style="font-size: 12px; margin-top: 24px; opacity: 0.8; color: #e0e0e0;">${propertyType}</div>
    `;

    // Content
    const content = document.createElement('div');
    content.id = 'zonaprop-content';
    content.style.cssText = `
      padding: 16px;
      overflow-y: auto;
      flex: 1;
      background: #1e1e1e;
    `;

    updateCardContent(content, stats);

    // Footer with buttons
    const footer = document.createElement('div');
    footer.style.cssText = `
      padding: 12px 16px;
      border-top: 1px solid #333;
      display: flex;
      gap: 8px;
      background: #1a1a1a;
    `;
    footer.innerHTML = `
      <button id="zonaprop-reset-btn" style="width: 100%; padding: 8px 16px; background: #dc2626; color: #e0e0e0; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 500; transition: background 0.2s;">Reiniciar</button>
    `;

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(footer);
    document.body.appendChild(card);

    // Make draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
      if (e.target.id === 'zonaprop-close-btn') return;
      initialX = e.clientX - card.offsetLeft;
      initialY = e.clientY - card.offsetTop;
      isDragging = true;
    }

    function drag(e) {
      if (!isDragging) return;
      e.preventDefault();
      currentX = e.clientX - initialX;
      currentY = e.clientY - initialY;
      card.style.left = currentX + 'px';
      card.style.top = currentY + 'px';
      card.style.right = 'auto';
    }

    function dragEnd() {
      isDragging = false;
    }

    // Close button
    document.getElementById('zonaprop-close-btn').addEventListener('click', () => {
      card.remove();
    });

    // Reset button
    const resetBtn = document.getElementById('zonaprop-reset-btn');
    resetBtn.addEventListener('click', () => {
 
        sessionStorage.removeItem(STORAGE_KEY);

        // Rescrape current page
        const { properties: newProperties } = scrapePropertyData();

        if (newProperties.length > 0) {
          // Save new data
          const propertyType = getPropertyType();
          saveData({
            properties: newProperties,
            propertyType: propertyType,
            scrapedPropertyIds: newProperties.map(p => p.id),
            lastPageId: getCurrentPageId()
          });

          // Update display
          const stats = calculateStats(newProperties);
          const contentElement = document.getElementById('zonaprop-content');
          if (contentElement) {
            updateCardContent(contentElement, stats);
          }

          console.log('[ZonaProp Analyzer] Reset complete. Found', newProperties.length, 'properties on current page');
        } else {
          // No properties on current page, just clear the display
          const contentElement = document.getElementById('zonaprop-content');
          if (contentElement) {
            updateCardContent(contentElement, null);
          }
          console.log('[ZonaProp Analyzer] Reset complete. No properties on current page');
        }
    });

    resetBtn.addEventListener('mouseenter', () => {
      resetBtn.style.background = '#b91c1c';
    });
    resetBtn.addEventListener('mouseleave', () => {
      resetBtn.style.background = '#dc2626';
    });

    return card;
  }

  // Update data function
  function updateData(isAutoUpdate = false) {

    const storedData = loadStoredData();

    const { properties: newProperties, propertyIds: newPropertyIds } = scrapePropertyData();

    if (newProperties.length === 0) {
      console.log('[ZonaProp Analyzer] No properties found on page');
      return;
    }

    // Get existing property IDs
    const existingIds = new Set(storedData.scrapedPropertyIds || []);
    console.log('[ZonaProp Analyzer] Already have', existingIds.size, 'property IDs');

    // Filter out duplicates
    const uniqueNewProperties = newProperties.filter(p => !existingIds.has(p.id));
    console.log('[ZonaProp Analyzer] Found', uniqueNewProperties.length, 'new unique properties');

    if (uniqueNewProperties.length === 0) {
      console.log('[ZonaProp Analyzer] All properties already exist');
      return;
    }

    // Merge with stored data
    const allProperties = [...storedData.properties, ...uniqueNewProperties];
    const allPropertyIds = [...Array.from(existingIds), ...uniqueNewProperties.map(p => p.id)];

    // Get property type
    const propertyType = getPropertyType();

    // Save updated data
    saveData({
      properties: allProperties,
      propertyType: propertyType || storedData.propertyType,
      scrapedPropertyIds: allPropertyIds,
      lastPageId: getCurrentPageId()
    });

    // Calculate stats
    const stats = calculateStats(allProperties);

    // Update UI
    const contentElement = document.getElementById('zonaprop-content');
    if (contentElement) {
      updateCardContent(contentElement, stats);
    }

    // Show notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 1000000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    `;
    notification.textContent = `✓ ${uniqueNewProperties.length} propiedades agregadas`;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Setup auto-detection for SPA navigation
  function setupAutoDetection() {
    let lastPageId = getCurrentPageId();
    console.log('[ZonaProp Analyzer] Initial page:', lastPageId);

    // Check for URL changes periodically
    const intervalId = setInterval(() => {
      const currentPageId = getCurrentPageId();

      // If URL changed, we're on a new page
      if (currentPageId !== lastPageId) {
        console.log('[ZonaProp Analyzer] Page change detected!');
        console.log('[ZonaProp Analyzer] Old:', lastPageId);
        console.log('[ZonaProp Analyzer] New:', currentPageId);

        lastPageId = currentPageId;

        // Wait for new content to load, then auto-update
        setTimeout(() => {
          console.log('[ZonaProp Analyzer] Checking for properties...');

          // Check if there are properties to scrape (page has loaded)
          const cards = document.querySelectorAll('[data-qa="posting PROPERTY"]');
          console.log('[ZonaProp Analyzer] Found', cards.length, 'property cards');

          if (cards.length > 0) {
            // Show brief notification that we detected a new page
            const notice = document.createElement('div');
            notice.style.cssText = `
              position: fixed;
              bottom: 20px;
              right: 20px;
              background: #2563eb;
              color: white;
              padding: 12px 20px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              z-index: 1000000;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 14px;
            `;
            notice.textContent = '🔄 Nueva página detectada, actualizando...';
            document.body.appendChild(notice);

            setTimeout(() => {
              notice.remove();
              console.log('[ZonaProp Analyzer] Calling updateData() with auto-update flag...');
              updateData(true);
            }, 500);
          } else {
            console.log('[ZonaProp Analyzer] No properties found yet, will retry on next interval');
          }
        }, 500); 
      }
    }, 500); // Check every 500ms

    // Store interval ID globally so we can debug if needed
    window.zonapropAnalyzerInterval = intervalId;
    console.log('[ZonaProp Analyzer] Auto-detection started. Interval ID:', intervalId);
  }


  // Main execution
  try {
    console.log('[ZonaProp Analyzer] Script started');

    // Check if card already exists
    const existingCard = document.getElementById(CARD_ID);
    console.log('[ZonaProp Analyzer] Existing card:', existingCard ? 'Found' : 'Not found');

    if (existingCard) {
      // Card exists, just update the data
      console.log('[ZonaProp Analyzer] Updating existing card...');
      updateData();
      return;
    }

    // Load existing data
    const storedData = loadStoredData();
    console.log('[ZonaProp Analyzer] Loaded stored data:', storedData.properties.length, 'properties');

    // Scrape current page
    console.log('[ZonaProp Analyzer] Starting to scrape page...');
    const { properties: newProperties, propertyIds: newPropertyIds } = scrapePropertyData();
    console.log('[ZonaProp Analyzer] Scraping complete. Found', newProperties.length, 'properties');

    if (newProperties.length === 0) {
      console.error('[ZonaProp Analyzer] ERROR: No properties found!');
      console.log('[ZonaProp Analyzer] Debug - Cards on page:', document.querySelectorAll('[data-qa="posting PROPERTY"]').length);
      alert('No se encontraron propiedades en esta página. Asegúrate de estar en una página de resultados de búsqueda de ZonaProp.');
      return;
    }

    // Get property type
    const propertyType = getPropertyType();

    // Get existing property IDs
    const existingIds = new Set(storedData.scrapedPropertyIds || []);

    // Filter out duplicates
    const uniqueNewProperties = newProperties.filter(p => !existingIds.has(p.id));

    // Merge with stored data
    const allProperties = [...storedData.properties, ...uniqueNewProperties];
    const allPropertyIds = [...Array.from(existingIds), ...uniqueNewProperties.map(p => p.id)];

    // Save updated data
    saveData({
      properties: allProperties,
      propertyType: propertyType || storedData.propertyType,
      scrapedPropertyIds: allPropertyIds,
      lastPageId: getCurrentPageId()
    });

    // Calculate stats
    const stats = calculateStats(allProperties);

    // Create UI
    createFloatingCard(stats, propertyType || storedData.propertyType);

    // Setup auto-detection for page navigation
    setupAutoDetection();

  } catch (error) {
    console.error('ZonaProp Analyzer Error:', error);
    alert('Error al analizar la página: ' + error.message);
  }
})();
