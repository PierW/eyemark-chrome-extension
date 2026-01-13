(() => {
  const SITE_KEY = "immobiliare";
  const STORAGE_KEY = "seenListings";
  const ENABLED_KEY = "extensionEnabled";

  const GALLERY_SELECTOR = ".nd-slideshow__arrow";

  let observer = null;
  let lastUrl = location.href;

  /* ================= STORAGE ================= */

  function getStorage(cb) {
    chrome.storage.local.get([STORAGE_KEY], (r) => cb(r[STORAGE_KEY] || {}));
  }

  function markAsSeen(id) {
    getStorage((data) => {
      data[SITE_KEY] ??= {};
      if (data[SITE_KEY][id]) return;
      data[SITE_KEY][id] = true;
      chrome.storage.local.set({ [STORAGE_KEY]: data });
    });
  }

  /* ================= ITEM ================= */

  function processItem(item, seenMap) {
    const id = item.id;
    if (!id) return;
    if (item.dataset.processed) return;

    item.dataset.processed = "true";

    if (seenMap?.[SITE_KEY]?.[id]) {
      item.classList.add("annuncio-gia-visto");
      return;
    }

    item.addEventListener("click", () => {
      if (item.dataset.ignoreNextClick) return;

      markAsSeen(id);
      item.classList.add("annuncio-gia-visto");
      item.querySelector(".nmv-overlay")?.remove();
    });
  }

  /* ================= GALLERY ================= */

  function attachGalleryListeners(item) {
    const arrows = item.querySelectorAll(GALLERY_SELECTOR);
    if (!arrows.length) return;

    arrows.forEach((btn) => {
      if (btn.dataset.nmvBound) return;
      btn.dataset.nmvBound = "true";

      btn.addEventListener(
        "click",
        () => {
          // ❗ NON blocchiamo il click
          item.dataset.ignoreNextClick = "true";
          showOverlay(item);

          setTimeout(() => {
            delete item.dataset.ignoreNextClick;
          }, 300);
        },
        true // capture
      );
    });
  }

  /* ================= OVERLAY ================= */

  function showOverlay(item) {
    if (item.classList.contains("annuncio-gia-visto")) return;
    if (item.querySelector(".nmv-overlay")) return;

    const btn = document.createElement("button");
    btn.className = "nmv-overlay";
    btn.textContent = "Segna come visto";

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      markAsSeen(item.id);
      item.classList.add("annuncio-gia-visto");
      btn.remove();
    });

    // ✅ Trova il contenitore delle immagini invece dell'<li>
    const mediaContainer = item.querySelector(".nd-ratio--standard");
    
    if (mediaContainer) {
      mediaContainer.style.position = "relative";
      mediaContainer.appendChild(btn);
    } else {
      // Fallback se non trova il contenitore
      item.style.position = "relative";
      item.appendChild(btn);
    }
  }

  /* ================= SCAN ================= */

  function scanItems() {
    const items = document.querySelectorAll("li.nd-list__item[id]");
    if (!items.length) return;

    getStorage((seenMap) => {
      items.forEach((item) => {
        processItem(item, seenMap);
        attachGalleryListeners(item);
      });
    });
  }

  /* ================= OBSERVER ================= */

  function observeResults() {
    observer?.disconnect();
    observer = new MutationObserver(scanItems);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function watchUrlChanges() {
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        scanItems();
      }
    }, 500);
  }

  /* ================= INIT ================= */

  function init() {
    chrome.storage.local.get([ENABLED_KEY], (r) => {
      if (r[ENABLED_KEY] === false) return;
      scanItems();
      observeResults();
      watchUrlChanges();
    });
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", init)
    : init();
})();
