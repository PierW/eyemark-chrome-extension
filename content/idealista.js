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

    // evita doppio binding
    if (article.dataset.processed) return;
    article.dataset.processed = "true";

    applySeenState(article, listingId, seenMap);

    article.addEventListener("click", () => {
      markAsSeen(listingId);
      article.classList.add("annuncio-gia-visto");
    }, { once: true });
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
