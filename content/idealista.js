(() => {
  const SITE_KEY = "idealista";
  const STORAGE_KEY = "seenListings";
  const ENABLED_KEY = "extensionEnabled";


  /**
   * Utility: recupera lo storage completo
   */
  function getStorage(callback) {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      callback(result[STORAGE_KEY] || {});
    });
  }

  /**
   * Utility: salva un ID come visto
   */
  function markAsSeen(listingId) {
    getStorage((data) => {
      if (!data[SITE_KEY]) data[SITE_KEY] = {};
      if (data[SITE_KEY][listingId]) return;

      data[SITE_KEY][listingId] = true;
      chrome.storage.local.set({ [STORAGE_KEY]: data });
    });
  }

  /**
   * Applica lo stile "già visto" se necessario
   */
  function applySeenState(article, listingId, seenMap) {
    if (seenMap?.[SITE_KEY]?.[listingId]) {
      article.classList.add("annuncio-gia-visto");
      return;
    }
  }

  /**
   * Processa un singolo annuncio
   */
function processArticle(article, seenMap) {
  const listingId = article.getAttribute("data-element-id");
  if (!listingId) return;

  if (article.dataset.processed) return;
  article.dataset.processed = "true";

  if (seenMap?.[SITE_KEY]?.[listingId]) {
    article.classList.add("annuncio-gia-visto");
    return;
  }

  article.addEventListener("click", (e) => {
    // ❌ click su gallery → NON segnare come visto
    if (
      e.target.closest(
        ".image-gallery-icon.image-gallery-left-nav, .image-gallery-icon.image-gallery-right-nav"
      )
    ) {
      return;
    }

    // ❌ click sul nostro overlay
    if (e.target.closest(".nmv-overlay")) {
      return;
    }

    // ✅ segna come visto
    markAsSeen(listingId);
    article.classList.add("annuncio-gia-visto");

    // 🧹 FIX: rimuovi overlay se presente
    const overlay = article.querySelector(".nmv-overlay");
    if (overlay) overlay.remove();
  });

}


document.addEventListener("click", (e) => {
  const btn = e.target.closest(
    ".image-gallery-icon.image-gallery-left-nav, .image-gallery-icon.image-gallery-right-nav"
  );
  if (!btn) return;

  const article = btn.closest("article[data-element-id]");
  if (!article) return;

  article.dataset.galleryInteracted = "true";
  showMarkAsSeenOverlay(article);
});


function showMarkAsSeenOverlay(container) {
  if (container.querySelector(".nmv-overlay")) return;
  if (container.classList.contains("annuncio-gia-visto")) return;

  const overlay = document.createElement("button");
  overlay.className = "nmv-overlay";
  overlay.textContent = "Segna come visto";

  overlay.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();

    const listingId =
      container.getAttribute("data-element-id") || container.id;

    if (!listingId) return;

    markAsSeen(listingId);
    container.classList.add("annuncio-gia-visto");
    overlay.remove();
  });

  container.style.position = "relative";
  container.appendChild(overlay);
}


  /**
   * Scansiona tutti gli annunci visibili
   */
  function scanArticles() {
    const articles = document.querySelectorAll(
      "article.item.extended-item[data-element-id]"
    );

    getStorage((seenMap) => {
      articles.forEach((article) =>
        processArticle(article, seenMap)
      );
    });
  }

  /**
   * Observer per infinite scroll
   */
  const observer = new MutationObserver(() => {
    scanArticles();
  });

  function init() {

    chrome.storage.local.get([ENABLED_KEY], (result) => {
        if (result[ENABLED_KEY] === false) return;
        scanArticles();

        const container = document.querySelector(
        "section.items-container.items-list"
        );

        if (container) {
            observer.observe(container, {
                childList: true,
                subtree: true
            });
        }
    });

  }

  // init quando il DOM è pronto
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
