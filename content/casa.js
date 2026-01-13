(() => {
  const SITE_KEY = "casa";
  const STORAGE_KEY = "seenListings";
  const ENABLED_KEY = "extensionEnabled";

  const CARD_SELECTOR = 'div[role="article"].csaSrpcard__cnt-card';
  const GALLERY_SELECTOR = ".csaSrpcard__gal__slider__arrows";

  /**
   * Storage
   */
  function getStorage(callback) {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      callback(result[STORAGE_KEY] || {});
    });
  }

  function markAsSeen(listingId) {
    getStorage((data) => {
      if (!data[SITE_KEY]) data[SITE_KEY] = {};
      if (data[SITE_KEY][listingId]) return;

      data[SITE_KEY][listingId] = true;
      chrome.storage.local.set({ [STORAGE_KEY]: data });
    });
  }

  /**
   * Estrae ID immobile
   */
  function getListingId(card) {
    const anchor = card.querySelector(".csaSrpcard__anchor[id]");
    if (!anchor) return null;
    return anchor.id.replace("a_", "");
  }

  /**
   * Processa card
   */
  function processCard(card, seenMap) {
    if (card.dataset.processed) return;
    card.dataset.processed = "true";

    const listingId = getListingId(card);
    if (!listingId) return;

    if (seenMap?.[SITE_KEY]?.[listingId]) {
      card.classList.add("annuncio-gia-visto");
      return;
    }

    card.addEventListener("click", (e) => {
      // ❌ gallery
      if (e.target.closest(GALLERY_SELECTOR)) return;

      // ❌ overlay
      if (e.target.closest(".nmv-overlay")) return;

      // ✅ segna
      markAsSeen(listingId);
      card.classList.add("annuncio-gia-visto");

      const overlay = card.querySelector(".nmv-overlay");
      if (overlay) overlay.remove();
    });
  }

  /**
   * Gallery listener globale
   */
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(GALLERY_SELECTOR);
    if (!btn) return;

    const card = btn.closest(CARD_SELECTOR);
    if (!card) return;

    if (card.dataset.galleryInteracted) return;
    if (card.classList.contains("annuncio-gia-visto")) return;

    card.dataset.galleryInteracted = "true";
    showMarkAsSeenOverlay(card);
  });

  /**
   * Overlay
   */
  function showMarkAsSeenOverlay(card) {
    if (card.querySelector(".nmv-overlay")) return;

    const overlay = document.createElement("button");
    overlay.className = "nmv-overlay";
    overlay.textContent = "Segna come visto";

    overlay.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      const listingId = getListingId(card);
      if (!listingId) return;

      markAsSeen(listingId);
      card.classList.add("annuncio-gia-visto");
      overlay.remove();
    });

    // ✅ Trova il contenitore delle immagini invece dell'<li>
    const mediaContainer = card.querySelector(".csaSrpcard__gal__wrap");
    
    if (mediaContainer) {
      mediaContainer.appendChild(overlay);
    } else {
      // Fallback se non trova il contenitore
      card.style.position = "relative";
      card.appendChild(overlay);
    }

  }

  /**
   * Scan cards
   */
  function scanCards() {
    const cards = document.querySelectorAll(CARD_SELECTOR);
    if (!cards.length) return;

    getStorage((seenMap) => {
      cards.forEach((card) => processCard(card, seenMap));
    });
  }

  /**
   * Observer
   */
  const observer = new MutationObserver(scanCards);

  function init() {
    chrome.storage.local.get([ENABLED_KEY], (res) => {
      if (res[ENABLED_KEY] === false) return;

      scanCards();

      const container = document.querySelector(
        'div[role="region"][aria-label="Risultati di ricerca"]'
      );

      if (container) {
        observer.observe(container, {
          childList: true,
          subtree: true,
        });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
